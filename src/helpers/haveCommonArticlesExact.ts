export const haveCommonArticlesExact = (arr1: string[], arr2: string[]) => {
	if (arr1.length < arr2.length) {
		const set = new Set(arr1)
		return arr2.some((item) => set.has(item))
	} else {
		const set = new Set(arr2)
		return arr1.some((item) => set.has(item))
	}
}
