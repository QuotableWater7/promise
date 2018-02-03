const CP = require('..')

function expectEqual(val1, val2) {
	if (val1 !== val2) {
		throw new Error(`Not equal: ${val1}, ${val2}`)
	}
}

async function test(description, cb) {
	try {
		let timeoutHasPassed = false
		let before
		let after

		const timeout = setTimeout(() => {
			timeoutHasPassed = true
			console.log(`x timeout (${description})`)
		}, 1000)

		before = Number(new Date())
		await cb()
		after = Number(new Date())

		if (!timeoutHasPassed) {
			clearTimeout(timeout)
			console.log(`o ${description} (${after - before}ms)`)
		}
	} catch (e) {
		console.log(`x ${description}: ${e}`)
	}
}

test('It works when value resolves immediately', async () => {
	const result = await new CP(resolve => resolve(5))

	expectEqual(result, 5)
})

test('It works when value resolves later', async () => {
	const result = await new CP(resolve => {
		setTimeout(() => resolve(5), 1)
	})

	expectEqual(result, 5)
})

test('It can catch thrown error in resolver', async () => {
	const result = await new CP(resolve => {
		throw new Error('nooo')
	}).catch(error => {
		expectEqual(error.message, 'nooo')
	})
})

test('It can catch error immediately', async () => {
	await new CP((resolve, reject) => {
		reject('oops')
	})
		.catch(error => {
			expectEqual(error, 'oops')
		})
})

test('It can trap errors in try/catch', async () => {
	try {
		await new CP((resolve, reject) => {
			reject('unhandled')
		})
	} catch (e) {
		expectEqual(e, 'unhandled')
	}
})

test('It can catch errors that happen in "then" chain', async () => {
	await new CP((resolve, reject) => {
		resolve(4)
	})
		.then(() => {
			throw new Error('blah')
		})
		.catch(e => {
			expectEqual(e.message, 'blah')
		})
})

test('It can route errors to error handler in "then"', async () => {
	await new CP((resolve, reject) => {
		reject('shit')
	})
		.then(
			() => null,
			error => expectEqual(error, 'shit')
		)
})

test('It can catch delayed errors in "then"', async () => {
	await new CP((resolve, reject) => {
		setTimeout(() => reject('boop'), 1)
	})
		.then(
			() => null,
			error => expectEqual(error, 'boop')
		)
})

test('It can catch delayed errors in "catch"', async () => {
	await new CP((resolve, reject) => {
		setTimeout(() => reject('boop'), 1)
	})
		.catch(
			error => expectEqual(error, 'boop')
		)
})
