const P = require('..')

test('It throws error when you do not provide function', async () => {
	expect(() => P.promisify({})).toThrowError('must pass a function to promisify')
})

test('It returns a promise-returning function for node-style cb with one arg', async () => {
	function nodeStyleCb(done) {
		setTimeout(done, 10)
	}
	const promiseFn = P.promisify(nodeStyleCb)

	await expect(
		promiseFn()
	).resolves.toBeUndefined()
})

test('It returns a promise-returning function for node-style cb with multiple args', async () => {
	function nodeStyleCb(one, two, done) {
		setTimeout(done, 10)
	}
	const promiseFn = P.promisify(nodeStyleCb)

	await expect(
		promiseFn('a', 'b')
	).resolves.toBeUndefined()
})

test('It rejects the promise with the error passed to "done"', async () => {
	function nodeStyleCb(one, two, done) {
		setTimeout(() => done('oops'), 10)
	}
	const promiseFn = P.promisify(nodeStyleCb)

	await expect(
		promiseFn('a', 'b')
	).rejects.toThrowError('oops')
})

test('It resolves the promise with the result passed to "done"', async () => {
	function nodeStyleCb(one, two, done) {
		setTimeout(() => done(null, 'value'), 10)
	}
	const promiseFn = P.promisify(nodeStyleCb)

	await expect(
		promiseFn('a', 'b')
	).resolves.toBe('value')
})

test('It bubbles synchronous rejections to the promisified function', async () => {
	function nodeStyleCb(one, two, done) {
		throw new Error('beep boop arghhhh')
	}
	const promiseFn = P.promisify(nodeStyleCb)

	await expect(
		promiseFn('a', 'b')
	).rejects.toThrowError('beep boop arghhhh')
})
