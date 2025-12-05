import { getDoubleFrameCode } from './double_frame.js'
import { generateCodeFromCombination } from './driver.js'
import { getFrameCode } from './frame.js'
import { getLensCode } from './lens.js'
import { formatLedModuleCode } from './module.js'

const combination = {
	'Декоративная рамка': '41061-WH',
	'Светодиодный модуль': '44001-220V-3K',
	Драйвер: 'не выбран',
	Линза: '43002-38',
	'Фиксирующее кольцо': '42001-WH',
}

const generateVirtualArticle = (combination) => {
	return (getFrameCode(combination) +
		'-' + formatLedModuleCode(combination) +
		'-' +
		generateCodeFromCombination(combination) +
		'-' + getLensCode(combination) +
		getDoubleFrameCode(combination)
	)
}

// Запуск обработки
const virtualArticle = generateVirtualArticle(combination)

if (virtualArticle) {
	console.log(`\n✅ Сборный артикул: ${virtualArticle}`)
} else {
	console.log('\n❌ Не удалось обработать артикулы')
}


export default generateVirtualArticle