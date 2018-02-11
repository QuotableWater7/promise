const P = require('..')

test('It works when value resolves immediately', async () => {
	const result = await new P(resolve => resolve(5))

	expect(result).toBe(5)
})

test('It works when value resolves later', async () => {
	const result = await new P(resolve => {
		setTimeout(() => resolve(5), 1)
	})

	expect(result).toBe(5)
})

test('It can catch thrown error in resolver', async () => {
	const result = await new P(resolve => {
		throw new Error('nooo')
	})
		.catch(error => {
			expect(error.message).toBe('nooo')
		})
})

test('It can catch error immediately', async () => {
	expect(
		new P((resolve, reject) => {
			reject('right awayyyy')
		})
	).rejects.toThrowError('right awayyyy')
})

test('It can trap errors in try/catch', async () => {
	try {
		await new P((resolve, reject) => {
			reject('unhandled')
		})
	} catch (error) {
		expect(error).toBe('unhandled')
	}
})

test('It can catch errors that happen in "then" chain', async () => {
	await new P((resolve, reject) => {
		resolve(4)
	})
		.then(() => {
			throw new Error('blah')
		})
		.catch(e => {
			expect(e.message).toBe('blah')
		})
})

test('It can route errors to error handler in "then"', async () => {
	await new P((resolve, reject) => {
		reject('shit')
	})
		.then(
			() => null,
			error => expect(error).toBe('shit')
		)
})

test('It can handle delayed errors in "then"', async () => {
	await expect(
		new P((resolve, reject) => {
			setTimeout(() => reject('boop'), 1)
		})
			.then(
				() => null,
				error => 'delayed error in then: ' + error
			)
	).resolves.toBe('delayed error in then: boop')
})

test('It can catch delayed errors in "catch"', async () => {
	await expect(
		new P((resolve, reject) => {
			setTimeout(() => reject('boop'), 50)
		})
			.catch(error => 'delayed error in catch: ' + error)
	).resolves.toBe('delayed error in catch: boop')
})

test('It can catch delayed errors in "catch" after a "then"', async () => {
	await expect(
		new P((resolve, reject) => {
			setTimeout(() => reject('boop'), 1)
		})
			.then(result => result)
			.catch(
				error => 'catch after then: ' + error
			)
	).resolves.toBe('catch after then: boop')
})

test('It can catch error that happens in "then"', async () => {
	await expect(
		new P((resolve, reject) => {
			setTimeout(() => resolve('boop'), 1)
		})
			.then(result => {
				throw new Error('oopsadoop')
			})
			.catch(error => error.message)
	).resolves.toBe('oopsadoop')
})

test('It executes promise constructor callback immediately', async () => {
	let whodunnit

	new P(resolve => {
		if (!whodunnit) {
			whodunnit = 'promise'
		}

		resolve()
	})


	if (!whodunnit) {
		whodunnit = 'main loop'
	}

	expect(whodunnit).toBe('promise')
})

test('It resolves .then call asynchronously', async () => {
	let whodunnit

	new P(resolve => resolve())
		.then(() => {
			if (!whodunnit) {
				whodunnit = 'then'
			}
		})

	if (!whodunnit) {
		whodunnit = 'main loop'
	}

	expect(whodunnit).toBe('main loop')
})

test('It resolves .catch call asynchronously', async () => {
	let whodunnit

	new P((resolve, reject) => reject())
		.catch(() => {
			if (!whodunnit) {
				whodunnit = 'then'
			}
		})

	if (!whodunnit) {
		whodunnit = 'main loop'
	}

	expect(whodunnit).toBe('main loop')
})
