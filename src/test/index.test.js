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
	await new P((resolve, reject) => {
		reject('oops')
	})
		.catch(error => {
			expect(error).toBe('oops')
		})
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

test('It can catch delayed errors in "then"', async () => {
	await new P((resolve, reject) => {
		setTimeout(() => reject('boop'), 1)
	})
		.then(
			() => null,
			error => expect(error).toBe('boop')
		)
})

test('It can catch delayed errors in "catch"', async () => {
	await new P((resolve, reject) => {
		setTimeout(() => reject('boop'), 1)
	})
		.catch(
			error => expect(error).toBe('boop')
		)
})

test('It can catch delayed errors in "catch" after a "then"', async () => {
	await new P((resolve, reject) => {
		setTimeout(() => reject('boop'), 1)
	})
		.then(result => result)
		.catch(
			error => expect(error).toBe('boop')
		)
})

test('It can catch error that happens in "then"', async () => {
	await new P((resolve, reject) => {
		setTimeout(() => resolve('boop'), 1)
	})
		.then(result => {
			throw new Error('oopsadoop')
		})
		.catch(
			error => expect(error.message).toBe('oopsadoop')
		)
})
