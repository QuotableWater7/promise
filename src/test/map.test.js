const P = require('..')

test('It can map using a promise-returning func with set concurrency', async () => {
	const array = [100, 200, 300, 400, 500]

	const promiseFunc = item => new P(resolve => {
		setTimeout(
			() => resolve(item),
			1000
		)
	})

	const [item1, item2, item3, item4, item5] = await P.map(array, promiseFunc)

	expect(item1).toBe(100)
	expect(item2).toBe(200)
	expect(item3).toBe(300)
	expect(item4).toBe(400)
	expect(item5).toBe(500)
})

test('It can map using a promise-returning func with set concurrency', async () => {
	const array = [100, 200, 300, 400, 500]

	const promiseFunc = item => new P(resolve => {
		setTimeout(
			() => resolve(item),
			1000
		)
	})

	const [item1, item2, item3, item4, item5] = await P.map(array, promiseFunc, { concurrency: 2 })

	expect(item1).toBe(100)
	expect(item2).toBe(200)
	expect(item3).toBe(300)
	expect(item4).toBe(400)
	expect(item5).toBe(500)
})

test('It can handle a failing promise', async () => {
	const array = [100, 200, 300, 400, 500]

	const promiseFunc = item => new P((resolve, reject) => {
		const finishFn = item === 300 ? reject : resolve

		setTimeout(
			() => finishFn(item),
			1000
		)
	})

	expect(
		P.map(array, promiseFunc, { concurrency: 2 })
	).rejects.toThrowError(300)
})
