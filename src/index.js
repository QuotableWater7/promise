const isPromise = value => (
	typeof value === 'object' &&
	typeof value.then === 'function'
)

class P {
	constructor(cb) {
		this.state = 'PENDING'
		this.callbacks = []

		// The next chunk of code executes the callback given to the promise.
		// Why are the resolve/reject calls wrapped in process.nextTick?
		// Native promises execute the callback passed to the constructor immediately,
		// but invoke the resolve/reject handlers asynchronously.
		try {
			cb(
				(...args) => process.nextTick(() => {
					this.resolve(...args)
				}),
				(...args) => process.nextTick(() => {
					this.reject(...args)
				})
			)
		} catch (error) {
			process.nextTick(() => this.reject(error))
		}
	}

	resolve(value) {
		this.state = 'RESOLVED'
		this.value = value

		this.callbacks.forEach(({ success, error }) => {
			try {
				success && success(value)
			} catch (e) {
				error && error(e)
			}
		})
	}

	reject(error) {
		this.state = 'REJECTED'
		this.error = error

		this.callbacks.forEach(({ error: errorFn }) => {
			errorFn(error)
		})
	}

	then(successFn, errorFn = null) {
		return new P((resolve, reject) => {
			if (this.state === 'RESOLVED') {
				resolve(successFn(this.value))
			} else if (this.state === 'REJECTED' && errorFn) {
				resolve(errorFn(this.error))
			} else if (this.state === 'PENDING') {
				this.callbacks.push({
					success: value => resolve(successFn(value)),
					error: errorFn ?
						error => resolve(errorFn(error)) :
						reject,
				})
			}
		})
	}

	catch(cb) {
		return new P(resolve => {
			if (this.state === 'REJECTED') {
				resolve(cb(this.error))
			} else if (this.state === 'PENDING') {
				this.callbacks.push({
					error: error => resolve(cb(error)),
				})
			}
		})
	}

	// iterate over each item in the array and process it with async "func"
	// once all are complete, we can resolve
	static each(array, func) {
		return new P((resolve, reject) => {
			function processItem(index) {
				if (index === array.length) {
					resolve()
					return
				}

				func(array[index])
					.then(() => processItem(index + 1))
					.catch(reject)
			}

			processItem(0)
		})
	}

	// wait until all promises in "promiseArray" have finished executing, then resolve with their
	// completed values in the same order as they were provided
	static all(promiseArray) {
		return new P((resolve, reject) => {
			const total = promiseArray.length
			const results = []

			if (total === 0) {
				resolve(results)
				return
			}

			let numCompleted = 0

			promiseArray.forEach((promise, index) => {
				promise
					.then(value => {
						results[index] = value
						numCompleted++

						if (numCompleted === total) {
							resolve(results)
						}
					})
					.catch(reject)
			})
		})
	}

	// given an array, map over it with async "func" until every item has been processed.
	// only "concurrency" promises are active at any given time.
	static map(array, func, { concurrency = Infinity } = {}) {
		return new P((resolve, reject) => {
			// even if concurrency is really high, we can't have more promises active
			// than the number of items in the array
			const maxActivePromises = Math.min(array.length, concurrency)

			const promises = []
			let currentIndex = 0

			// this helper function loads up a single promise.  each time a promise resolves,
			// we can check and see if there is another promise that can be queued up
			function executePromise() {
				const promise = func(array[currentIndex++])

				promise
					.then(result => {
						if (currentIndex === array.length) {
							// if we have already executed all promises, we can now just use P.all to wait
							// on them all being completed
							resolve(P.all(promises))
						} else {
							executePromise()
						}

						return result
					})
					.catch(reject)

				promises.push(promise)
			}

			// execute initial set of promises
			for (let i = 0; i < maxActivePromises; i++) {
				executePromise()
			}
		})
	}

	// similar to Array.prototype.reduce, except the reducer is an async function.
	// items are handled serially, so no more than one promise is awaiting resolution at any time.
	static reduce(array, reducer, initialValue) {
		const numItems = array.length

		return new P((resolve, reject) => {
			function processItem({ accum, index }) {
				const item = array[index]

				reducer(accum, item)
					.then(newResult => {
						if (index === numItems - 1) {
							resolve(newResult)
						} else {
							processItem({ accum: newResult, index: index + 1 })
						}
					})
					.catch(error => {
						reject(error)
					})
			}

			processItem({ accum: initialValue, index: 0 })
		})
	}

	// same as Bluebird's static props function
	static props(obj) {
		return new P((resolve, reject) => {
			const keys = Object.keys(obj)
			const result = {}

			const totalPromises = keys.length
			let completedPromises = 0
			let anyThrown = false

			keys.forEach(key => {
				obj[key]
					.then(value => {
						result[key] = value
						completedPromises++

						if (completedPromises === totalPromises && !anyThrown) {
							resolve(result)
						}
					})
					.catch(error => {
						if (!anyThrown) {
							anyThrown = true
							reject(error)
						}
					})
			})
		})
	}

	// behaves like an async function, or Bluebird's "coroutine".
	static co(generator) {
		return (...args) => new P((resolve, reject) => {
			const values = generator(...args)

			// this function helps us recursively iterate over yielded values
			function processValue(prev = null) {
				const { value, done } = values.next(prev)

				// done is true when both conditions are met:
				//  1) there are no more "yield" calls
				//  2) we've hit a return statement OR there is no return statement
				if (done) {
					if (isPromise(value)) {
						value
							.then(resolve)
							.catch(reject)
					} else {
						resolve(value)
					}

					return
				}

				// there are more values to handle in the generator, so let's get the value
				// and supply it to the next "processValue" call
				if (isPromise(value)) {
					value
						.then(processValue)
						.catch(reject)
				} else {
					processValue(value)
				}
			}

			processValue()
		})
	}

	// wait a specified time (optionally provide a return value)
	static delay(delay, value = undefined) {
		return new P(resolve => {
			setTimeout(() => resolve(value), delay)
		})
	}

	// return a promise that resolves with given value
	static resolve(value) {
		return new P(resolve => resolve(value))
	}

	static promisify(func) {
		if (typeof func !== 'function') {
			throw new Error('must pass a function to promisify')
		}

		return (...args) => new Promise((resolve, reject) => {
			func(...args, (error, result) => {
				if (error) {
					reject(error)
					return
				}

				resolve(result)
			})
		})
	}

	static promisifyAll(obj) {
		if (typeof obj !== 'object') {
			throw new Error('must pass an object to promisifyAll')
		}

		return Object.keys(obj).reduce((memo, key) => {
			memo[key] = typeof obj[key] === 'function' ?
				P.promisify(obj[key]) :
				obj[key]

			return memo
		}, {})
	}
}

module.exports = P
