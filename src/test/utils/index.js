module.exports = {
	expectEqual: (val1, val2) => {
		if (val1 !== val2) {
			throw new Error(`Not equal: ${val1}, ${val2}`)
		}
	},

	test: async (description, cb) => {
		let timeoutHasPassed = false
		let before
		let after

		const timeout = setTimeout(() => {
			timeoutHasPassed = true
			console.log(`x timeout (${description})`)
		}, 1000)

		try {
			before = Number(new Date())
			await cb()
			after = Number(new Date())

			if (!timeoutHasPassed) {
				clearTimeout(timeout)
				console.log(`o ${description} (${after - before}ms)`)
			}
		} catch (e) {
			clearTimeout(timeout)
			console.log(`x ${description}\n\t${e}`)
		}
	},
}
