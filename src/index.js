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
				success(value)
			} catch (e) {
				error(e)
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
}

module.exports = P
