const P = require('..')

test('It waits to resolve all the values of the object', async () => {
	const {
		one,
		two,
		three,
		four,
	} = await P.props({
		one: new P(resolve => resolve(1)),
		two: (async () => 2)(),
		three: new Promise(resolve => resolve(3)),
		four: P.delay(500, 'bloop')
	})

	expect(one).toBe(1)
	expect(two).toBe(2)
	expect(three).toBe(3)
	expect(four).toBe('bloop')
})

test('It catches errors on any of the promises', async () => {
	await expect(
		P.props({
			one: new P(resolve => resolve(1)),
			two: new P((resolve, reject) => {
				setTimeout(() => reject('bloo'), 1000)
			}),
			three: new P((resolve, reject) => {
				setTimeout(() => reject('blah'), 10)
			}),
		})
	).rejects.toThrow('blah')
})
