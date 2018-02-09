const P = require('..')

test('It can resolve empty array', async () => {
	const results = await P.all([])

	expect(results).toEqual([])
})

test('It can resolve many promises', async () => {
	const P1 = new P(resolve => setTimeout(() => resolve(1), 50))
	const P2 = new P(resolve => setTimeout(() => resolve(2), 60))
	const P3 = new P(resolve => setTimeout(() => resolve(3), 10))

	const [result1, result2, result3] = await P.all([P1, P2, P3])

	expect(result1).toBe(1)
	expect(result2).toBe(2)
	expect(result3).toBe(3)
})

test('It returns error from first failing promise', async () => {
	const P1 = new P(resolve => setTimeout(() => resolve(1), 50))
	const P2 = new P((resolve, reject) => setTimeout(() => reject(2), 60))
	const P3 = new P((resolve, reject) => setTimeout(() => reject(3), 10))

	expect(
		P.all([P1, P2, P3])
	).rejects.toThrowError(3)
})
