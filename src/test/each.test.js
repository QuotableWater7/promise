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
