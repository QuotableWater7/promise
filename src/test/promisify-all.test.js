const P = require('..')

test('It promisifies all functions on an object', async () => {
	const obj = {
		func1: done => {
			done(null, 'hello')
		},

		func2: (arg, done) => {
			done(arg) // passing error w/ first arg value
		},

		notAFunc: 2,

		alsoNotAFunc: 'weeee',
	}

	const promisified = P.promisifyAll(obj)

	expect(Object.keys(promisified).length).toBe(4)
	expect(promisified.notAFunc).toBe(2)
	expect(promisified.alsoNotAFunc).toBe('weeee')

	await expect(
		promisified.func1()
	).resolves.toBe('hello')

	await expect(
		promisified.func2('value')
	).rejects.toBe('value')
})
