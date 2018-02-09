const P = require('..')

test('It can reduce on promise-returning function', async () => {
	const array = [1, 2]

	const reducer = (memo, item) => new P(resolve => {
		setTimeout(
			() => resolve(memo + item),
			10
		)
	})

	const result = await P.reduce(array, reducer, 0)

	expect(result).toBe(3)
})

test('It can reduce on async function', async () => {
	const array = [1, 2, 3, 4]

	const reducer = async (memo, item) => {
		return memo + item
	}

	const result = await P.reduce(array, reducer, 0)

	expect(result).toBe(10)
})

test('It can handle when a promise rejects', async () => {
	const array = [1, 2, 3, 4]

	const reducer = (memo, item) => new P((resolve, reject) => {
		if (item === 3) {
			reject('oops')
		}

		resolve(memo + item)
	})

	expect(
		P.reduce(array, reducer, 0)
	).rejects.toThrowError('oops')
})

test('It can handle when an async function throws', async () => {
	const array = [1, 2, 3, 4]

	const reducer = async (memo, item) => {
		if (item === 3) {
			throw new Error('oops')
		}

		return memo + item
	}

	expect(
		P.reduce(array, reducer, 0)
	).rejects.toThrowError('oops')
})
