const P = require('..')

const { test, expectEqual } = require('./utils')

test('It can resolve empty array', async () => {
	const results = await P.all([])

	expectEqual(results, [])
})

test('It can resolve many promises', async () => {
	const P1 = new P(resolve => setTimeout(() => resolve(1), 50))
	const P2 = new P(resolve => setTimeout(() => resolve(2), 60))
	const P3 = new P(resolve => setTimeout(() => resolve(3), 10))

	const [result1, result2, result3] = await P.all([P1, P2, P3])

	expectEqual(result1, 1)
	expectEqual(result2, 2)
	expectEqual(result3, 3)
})
