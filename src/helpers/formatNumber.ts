export const formatNumber = (num: number | string): string => {
	let numberToFormat: number

	if (typeof num === 'string') {
		numberToFormat = parseFloat(num)
	} else {
		numberToFormat = num
	}

	return numberToFormat.toLocaleString('ru-RU')
}