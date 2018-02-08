const P = require('..')

const { test, expectEqual } = require('./utils')

test('It can map using a promise-returning func with set concurrency', async () => {
	const array = [100, 200, 300, 400, 500]

	const promiseFunc = item => new P(resolve => {
		setTimeout(
			() => resolve(item),
			1000
		)
	})

	const [item1, item2, item3, item4, item5] = await P.map(array, promiseFunc)

	expectEqual(item1, 100)
	expectEqual(item2, 200)
	expectEqual(item3, 300)
	expectEqual(item4, 400)
	expectEqual(item5, 500)
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

	expectEqual(item1, 100)
	expectEqual(item2, 200)
	expectEqual(item3, 300)
	expectEqual(item4, 400)
	expectEqual(item5, 500)
})
