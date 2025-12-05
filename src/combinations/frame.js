// Упрощенная версия для быстрого использования
export function getFrameCode(combination) {
	let frameArticle = null

	for (const step in combination) {
		const article = combination[step]
		if (!article) continue

		if (
			article.startsWith('4100') &&
			!article.startsWith('41007') &&
			!article.startsWith('41008')
		) {
			frameArticle = article
			if (!frameArticle) return null
			return getFrameSoftTwist(frameArticle)
		}
		if (article.startsWith('50002')) {
			return getSoft(combination)
		}
		if (article.startsWith('50001')) {
			return getSoftMini(combination)
		}
		if (article.startsWith('41021-1')) {
			return getFrameAL(combination, '40001', '41021-1', '11')
		}
		if (article.startsWith('41041-1')) {
			return getFrameAL(combination, '40003', '41041-1', '16')
		}
		if (article.startsWith('41061-1')) {
			return getFrameAL(combination, '40004', '41061-1', '12')
		}
		if (
			article.startsWith('41021') ||
			article.startsWith('41061') ||
			article.startsWith('41023') ||
			article.startsWith('41041')
		) {
			return getFrameLockSimple(combination)
		}
	}
	return null
}

function getFrameSoftTwist(frameArticle) {
	let afterDash
	let lastDigit
	let result = ''
	const frameParts = frameArticle.split('-')
	if (frameParts.length !== 2) return null

	const beforeDash = frameParts[0]
	afterDash = frameParts[1]
	lastDigit = beforeDash.slice(-1)

	result = '6'
	result += '0'
	result += lastDigit + afterDash
	return result
}

function getFrameLockSimple(combination) {
	let mounting = null
	let ring = null
	let frame = null

	let firstDigit = '6'

	for (const step in combination) {
		//console.log(combination[step])
		const article = combination[step]
		if (!article) continue

		if (article.startsWith('4000')) mounting = article
		if (article.startsWith('4200')) ring = article
		if (article.startsWith('410')) frame = article
	}
	//  console.log("!!!!",mounting, ring, frame)
	if (!ring || !frame) return null
	if (!mounting) firstDigit = '5' //без монтажного комплекта

	const partsFrame = frame.split('-')
	let framePart = ''
	let thirdDigit = ''
	if (partsFrame.length === 2) {
		framePart = partsFrame[0].slice(-2)
		if (framePart == '21') thirdDigit = '4'
		if (framePart == '61') thirdDigit = '5'
		if (framePart == '23') thirdDigit = '7'
		if (framePart == '41') thirdDigit = '6'
	}

	let secondDigit = ''
	//console.log(secondDigit, ring)
	if (ring === '42001-BK') secondDigit = '1'
	if (ring === '42001-WW' || ring === '42001-WH') secondDigit = '2'
	if (ring === '42002-BK') secondDigit = '3'
	if (ring === '42004-BK') secondDigit = '5'
	//console.log(secondDigit)

	const frameSuffix = frame.split('-')[1]

	return firstDigit + secondDigit + thirdDigit + frameSuffix
}

function getFrameAL(combination, moutingArticle, frameArticle, digit23) {
	let mounting = null
	let frame = null
	let firstDigit = '6'

	for (const step in combination) {
		const article = combination[step]
		if (!article) continue

		if (article.startsWith(moutingArticle)) mounting = article
		if (article.startsWith(frameArticle)) frame = article
	}
	if (!frame) return null
	if (!mounting) firstDigit = '5'

	const frameSuffix = frame.split('-')[2]

	return firstDigit + digit23 + frameSuffix
}

function getSoftMini(combination) {
	let mounting = null

	for (const step in combination) {
		//console.log(combination[step])
		const article = combination[step]
		if (!article) continue

		if (article.startsWith('50001')) mounting = article
	}

	if (!mounting) return null

	const mountingSuffix = mounting.split('-')[1]

	return `701${mountingSuffix}`
}

function getSoft(combination) {
	let mounting = null
	let ring = null
	let frame = null

	for (const step in combination) {
		//console.log(combination[step])
		const article = combination[step]
		if (!article) continue

		if (article.startsWith('50002')) mounting = article
		if (article.startsWith('42001')) ring = article
		if (article.startsWith('41')) frame = article
	}
	// console.log(mounting, ring, frame)
	if (!mounting || !ring || !frame) return null

	const mountingSuffix = mounting.split('-')[1]
	const ringSuffix = ring.split('-')[1]
	const frameSuffix = frame.split('-')[1]

	const secondDigit = ringSuffix === 'BK' ? '1' : '2'
	const thirdDigit = mountingSuffix === 'BK' ? '1' : '2'

	return `7${secondDigit}${thirdDigit}${frameSuffix}`
}

// Пример использования с вашей комбинацией
const combination = {
	'Монтажный комплект': '40002-89',
	'Декоративная рамка': '41023-GD',
	'Фиксирующее кольцо': '42001-WW',
	'Светодиодный модуль': '44001-220V-4K',
	Драйвер: null,
	Линза: '43001-08',
}

// Запуск обработки
console.log('🚀 ОБРАБОТКА КОМБИНАЦИИ:\n')
//const result = analyzeCombination(combination);
const result = getFrameCode(combination)
console.log(result)

if (result) {
	console.log(`\n✅ Финальный результат: ${result}`)
} else {
	console.log('\n❌ Не удалось сформировать код')
}
