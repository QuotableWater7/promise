const P = require('..')

const { test, expectEqual } = require('./utils')

test('It works when value resolves immediately', async () => {
	const result = await new P(resolve => resolve(5))

	expectEqual(result, 5)
})

test('It works when value resolves later', async () => {
	const result = await new P(resolve => {
		setTimeout(() => resolve(5), 1)
	})

	expectEqual(result, 5)
})

test('It can catch thrown error in resolver', async () => {
	const result = await new P(resolve => {
		throw new Error('nooo')
	})
		.catch(error => {
			expectEqual(error.message, 'nooo')
		})
})

test('It can catch error immediately', async () => {
	await new P((resolve, reject) => {
		reject('oops')
	})
		.catch(error => {
			expectEqual(error, 'oops')
		})
})

test('It can trap errors in try/catch', async () => {
	try {
		await new P((resolve, reject) => {
			reject('unhandled')
		})
	} catch (e) {
		expectEqual(e, 'unhandled')
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
			expectEqual(e.message, 'blah')
		})
})

test('It can route errors to error handler in "then"', async () => {
	await new P((resolve, reject) => {
		reject('shit')
	})
		.then(
			() => null,
			error => expectEqual(error, 'shit')
		)
})

test('It can catch delayed errors in "then"', async () => {
	await new P((resolve, reject) => {
		setTimeout(() => reject('boop'), 1)
	})
		.then(
			() => null,
			error => expectEqual(error, 'boop')
		)
})

test('It can catch delayed errors in "catch"', async () => {
	await new P((resolve, reject) => {
		setTimeout(() => reject('boop'), 1)
	})
		.catch(
			error => expectEqual(error, 'boop')
		)
})
