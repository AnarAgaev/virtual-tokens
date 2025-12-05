import { generateVirtualArticle } from './virtual_article.js'

const combination = {
	'Декоративная рамка': '41061-WH',
	'Светодиодный модуль': '44001-220V-3K',
	Драйвер: 'не выбран',
	Линза: '43002-38',
	'Фиксирующее кольцо': '42001-WH',
}

const virtualArticle = generateVirtualArticle(combination)
export function generateVirtualName(virtualArticle) {
	return (
		positionName('frame', virtualArticle) +
		' ' +
		positionName('module', virtualArticle) +
		' ' +
		positionName('lens', virtualArticle) +
		' ' +
		positionName('driver', virtualArticle) +
		' ' +
		positionName('color', virtualArticle) +
		' ' +
		positionNoCompect('frame', virtualArticle)
	)
}

const nameParts = {
	frame: {
		601: 'Софт 85',
		602: 'Софт 85',
		603: 'Фрейм Софт 85',
		604: 'Фрейм Софт 85',
		605: 'Твист 85',
		606: 'Фрейм Твист 85',
		614: 'Симпл 68',
		514: 'Симпл 68 без монтажного комплекта',
		624: 'Симпл 68',
		524: 'Симпл 68 без монтажного комплекта',
		634: 'Симпл 68',
		534: 'Симпл 68 без монтажного комплекта',
		644: 'Симпл 68',
		544: 'Симпл 68 без монтажного комплекта',
		611: 'Симпл 68 AL',
		511: 'Симпл 68 AL без монтажного комплекта',
		615: 'Лок 68',
		515: 'Лок 68 без монтажного комплекта',
		625: 'Лок 68',
		525: 'Лок 68 без монтажного комплекта',
		635: 'Лок 68',
		535: 'Лок 68 без монтажного комплекта',
		645: 'Лок 68',
		545: 'Лок 68 без монтажного комплекта',
		612: 'Лок 68 AL',
		512: 'Лок 68 AL без монтажного комплекта',
		617: 'Фрейм Симпл 68',
		517: 'Фрейм Симпл 68 без монтажного комплекта',
		627: 'Фрейм Симпл 68',
		527: 'Фрейм Симпл 68 без монтажного комплекта',
		637: 'Фрейм Симпл 68',
		537: 'Фрейм Симпл 68 без монтажного комплекта',
		647: 'Фрейм Симпл 68',
		547: 'Фрейм Симпл 68 без монтажного комплекта',
		656: 'Симпл 50',
		556: 'Симпл 50 без монтажного комплекта',
		616: 'Симпл 50 AL',
		516: 'Симпл 50 AL без монтажного комплекта',
		666: 'Симпл 50',
		566: 'Симпл 50 без монтажного комплекта',
		711: 'Софт чёрный',
		712: 'Софт чёрный',
		721: 'Софт белый',
		722: 'Софт белый',
		701: 'Софт мини',
	},
	color: {
		BK: 'чёрный',
		WH: 'белый',
		GD: 'золотой',
		BR: 'латунь',
	},
	module: {
		'0103K': '220В 6Вт 3000K 93+',
		'0104K': '220В 6Вт 4000K 93+',
		'0203K': '220В 9Вт 3000K 93+',
		'0204K': '220В 9Вт 4000K 93+',
		'02DTW': '220В 10Вт 1800 – 3000K 93+',
		'0227K': '220В 9Вт 2700K 93+',
		'050TW': '220В 13Вт 2700 – 6500K 93+',
		'0303K': '220В 13Вт 3000K 93+',
		'0304K': '220В 13Вт 4000K 93+',
		'0403K': '220В 16Вт 3000K 93+',
		'0404K': '220В 16Вт 4000K 93+',
	},
	driver: {
		'000102': 'TRIAC',
		'000202': 'TRIAC',
		'000302': 'TRIAC',
		'000402': 'TRIAC',
		'001205': 'DALI',
		'220V02': 'TRIAC интегрированный драйвер',
		'000006': 'ZIGBEE',
		'000004': 'DALI',
		'000002': 'TRIAC',
	},
	lens: {
		'0108': '8°',
		'0115': '15°',
		'0136': '36°',
		'0160': '60°',
		'0218': '18°',
		'0238': '38°',
		'0250': '50°',
		'0330': '30°',
		'0350': '50°',
		'0430': '30°',
		'0450': '50°',
	},
}

function positionName(category, inputString) {
	if (!nameParts[category]) {
		return 'Категория не найдена'
	}

	for (const [code, name] of Object.entries(nameParts[category])) {
		if (inputString.includes(code)) {
			return removePhrase(name)
		}
	}
	return 'Не найдено'
}

function positionNoCompect(category, inputString) {
	if (!nameParts[category]) {
		return 'Категория не найдена'
	}
	const noComplect = 'без монтажного комплекта'

	for (const [code, name] of Object.entries(nameParts[category])) {
		if (inputString.includes(code) && name.includes(noComplect)) {
			return noComplect
		}
	}
	return ''
}

function removePhrase(text) {
	return text.replace(/без монтажного комплекта\s*/g, '').trim()
}

// Использование
console.log(generateVirtualName(virtualArticle))
