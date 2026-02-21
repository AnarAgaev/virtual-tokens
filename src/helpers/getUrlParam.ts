export const getUrlParam = (paramName: string): string | null => {
	if (typeof window === 'undefined') return null // защита для SSR

	const urlParams = new URLSearchParams(window.location.search)
	const value = urlParams.get(paramName)

	return value ? decodeURIComponent(value) : null
}
