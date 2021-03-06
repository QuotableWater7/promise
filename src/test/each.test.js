const P = require('..')

test('It executes async function on each item', async () => {
	const expected = [1, 2, 3]
	const actual = []

	await P.each(
		[1, 2, 3],
		async item => actual.push(item)
	)

	expect(actual).toEqual(expected)
})

test('It does nothing when array is empty', async () => {
	await expect(
		P.each(
			[],
			async () => { throw new Error('blah') }
		)
	).resolves.toBeUndefined()
})

test('It can catch an error from one of the executions', async () => {
	const items = [1, 2, 3]

	async function maybeThrow(item) {
		if (item > 1) {
			throw new Error('oops')
		}
	}

	await expect(
		P.each(items, maybeThrow)
	).rejects.toThrowError('oops')
})

test('It can catch an error from a promise-returning async func', async () => {
	const items = [1, 2, 3]

	function maybeThrow(item) {
		throw new Error('sync error')

		return new P(resolve => resolve())
	}

	await expect(
		P.each(items, maybeThrow)
	).rejects.toThrowError('sync error')
})

test('Recursive calls do not overflow the stack', async () => {
	const array = new Array(1000000)

	const promiseFunc = async () => {}

	await P.each(array, promiseFunc, 0)
})
