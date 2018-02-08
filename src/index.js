class P {
	constructor(cb) {
		this.state = 'PENDING'
		this.resolvedCallbacks = []
		this.rejectedCallbacks = []

		this.rejectionWasHandled = false

		process.nextTick(() => {
			try {
				cb(
					this.resolve.bind(this),
					this.reject.bind(this)
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

			promiseArray.forEach((promise, index) => {
				promise
					.then(value => {
						results[index] = value
						numCompleted++

						if (numCompleted === total) {
							resolve(results)
						}
					})
					.catch(error => reject(error))
			})
		})
	}

	static map(array, func, { concurrency = Infinity } = {}) {
		return new P(resolve => {
			// load up `concurrency` promises that when resolved, queue up the next promise
			// once we've sent out final promise, return P.all(promises)
			const totalItems = array.length
			const initialToCommence = Math.min(totalItems, concurrency)

			const promises = []
			let currentIndex = 0

			function queuePromise() {
				const promise = func(array[currentIndex++])

				promise.then(result => {
					if (currentIndex === totalItems) {
						resolve(P.all(promises))
					} else {
						queuePromise()
					}

					return result
				})

				promises.push(promise)
			}

			for (let i = 0; i < initialToCommence; i++) {
				queuePromise()
			}
		})
	}
}

module.exports = P
