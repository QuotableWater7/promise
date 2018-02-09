class P {
	constructor(cb) {
		this.state = 'PENDING'
		this.resolvedCallbacks = []
		this.rejectedCallbacks = []

		this.rejectionWasHandled = false

		process.nextTick(() => {
			try {
				cb(
					(...args) => this.resolve(...args),
					(...args) => this.reject(...args)
				)
			} catch (e) {
				this.reject(e)
			}
		})
	}

	resolve(value) {
		this.state = 'RESOLVED'
		this.value = value

		this.resolvedCallbacks.forEach(({ success, error }) => {
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

		this.resolvedCallbacks.forEach(({ error: errorFn }) => {
			errorFn(error)
		})
	}

	then(successFn, errorFn) {
		return new P((resolve, reject) => {
			if (this.state === 'RESOLVED') {
				try {
					resolve(successFn(this.value))
				} catch (e) {
					reject(e)
				}
			} else if (this.state === 'REJECTED' && errorFn) {
				resolve(errorFn(this.error))
			} else if (this.state === 'PENDING') {
				this.resolvedCallbacks.push({
					success: value => resolve(successFn(value)),
					error: errorFn ? error => resolve(errorFn(error)) : () => null
				})
			}
		})
	}

	catch(cb) {
		if (this.state === 'REJECTED') {
			cb(this.error)
		} else if (this.state === 'PENDING') {
			this.resolvedCallbacks.push({ error: cb })
		}
	}

	static all(promiseArray) {
		return new P((resolve, reject) => {
			const total = promiseArray.length
			const results = []

			if (total === 0) {
				resolve(results)
				return
			}

			let numCompleted = 0
			let anyThrown = false

			promiseArray.forEach((promise, index) => {
				promise
					.then(value => {
						if (anyThrown) {
							return
						}

						results[index] = value
						numCompleted++

						if (numCompleted === total) {
							resolve(results)
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

	static map(array, func, { concurrency = Infinity } = {}) {
		return new P((resolve, reject) => {
			// even if concurrency is really high, we can't have more promises active
			// than the number of items in the array
			const maxActivePromises = Math.min(array.length, concurrency)

			// if any promise fails, we want to reject a single time with that error
			let anyThrown = false

			const promises = []
			let currentIndex = 0

			// this helper function loads up a single promise.  each time a promise resolves,
			// we can check and see if there is another promise that can be queued up
			function executePromise() {
				if (anyThrown) {
					return
				}

				const promise = func(array[currentIndex++])

				promise
					.then(result => {
						// don't do anything if another promise has already failed
						if (anyThrown) {
							return
						}

						if (currentIndex === array.length) {
							// if we have already executed all promises, we can now just use P.all to wait
							// on them all being completed
							resolve(P.all(promises))
						} else {
							executePromise()
						}

						return result
					})
					.catch(error => {
						if (!anyThrown) {
							anyThrown = true
							reject(error)
						}
					})

				promises.push(promise)
			}

			// execute initial set of promises
			for (let i = 0; i < maxActivePromises; i++) {
				executePromise()
			}
		})
	}

	static reduce(array, reducer, initialValue) {
		const numItems = array.length
		let result = initialValue
		let index = 0

		return new P(resolve => {
			function processItem() {
				const item = array[index++]

				reducer(result, item)
					.then(newResult => {
						result = newResult

						if (index === numItems) {
							resolve(result)
						} else {
							processItem()
						}
					})
			}

			processItem()
		})
	}
}

module.exports = P
