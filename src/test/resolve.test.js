const P = require('..')

test('It returns promise that has resolved with provided value', async () => {
	expect(
		P.resolve('blah')
	).resolves.toBe('blah')
})
