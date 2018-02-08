module.exports = {
	expectEqualArr: (val1, val2) => {
		if (val1.length !== val2.length) {
			throw new Error(`Array 1 is length ${val1.length} and array 2 is length ${val2.length}`)
		}

		val1.forEach((value, index) => {
			if (value !== val2[index]) {
				throw new Error(`Array value ${value} not equal to ${val2[index]}`)
			}
		})
	},

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
		}, 5000)

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
