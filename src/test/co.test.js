const P = require('..')

test('It can accept arguments', async () => {
	const co = P.co(function* doThings(a, b) {
		return a + b
	})

	expect(
		co(1, 2)
	).resolves.toBe(3)
})

test('It can resolve yielded promise', async () => {
	const co = P.co(function* doThings() {
		return yield new P(resolve => resolve(4))
	})

	expect(
		co()
	).resolves.toBe(4)
})

test('It can resolve multiple yielded promises', async () => {
	const co = P.co(function* doThings() {
		const a = yield new P(resolve => resolve(4))
		const b = yield new P(resolve => resolve(5))

		return a + b
	})

	expect(
		co()
	).resolves.toBe(9)
})

test('It works when non-promises are yielded', async () => {
	const co = P.co(function* doThings() {
		const a = yield 3
		const b = yield 7

		return a + b
	})

	expect(
		co()
	).resolves.toBe(10)
})

test('It works when the returned value is a promise', async () => {
	const co = P.co(function* doThings() {
		return new P(resolve => resolve(42))
	})

	expect(
		co()
	).resolves.toBe(42)
})

test('It properly catches errors from sync code', async () => {
	const co = P.co(function* doThings() {
		throw new Error('boo')
	})

	expect(
		co()
	).rejects.toThrowError('boo')
})

test('It properly catches errors from async code', async () => {
	const co = P.co(function* doThings() {
		yield new P((resolve, reject) => reject('nooo'))
	})

	expect(
		co()
	).rejects.toThrowError('nooo')
})
