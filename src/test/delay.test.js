const P = require('..')

test('It waits the specified amount of time', async () => {
	const timeoutAmount = 50

	const before = new Date()
	await P.delay(timeoutAmount)
	const after = new Date()

	expect(after - before).toBeGreaterThanOrEqual(timeoutAmount)
})

test('It returns the provided value', async () => {
	const expected = 'beep boop'
	const actual = await P.delay(10, expected)

	expect(expected).toBe(actual)
})
