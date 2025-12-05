import { analyzeCombinations } from './configuration.js'
import { fileName, saveArrayToExcel, setFrameAL } from './modifications.js'
import { generateVirtualArticle } from './virtual_article.js'
import { generateVirtualName } from './virtual_name.js'

const combination = {
	'Декоративная рамка': '41004-WH',
	'Светодиодный модуль': '44001-220V-3K',
	Драйвер: 'не выбран',
	Линза: '43002-38',
}

const configArticles = []
const urlApi = 'https://technolight.ru/api/dots/3'
analyzeCombinations(urlApi, true, false).then((combinations) => {
	combinations.forEach((combination) => {
		setFrameAL(combination)
		const virtualArticle = generateVirtualArticle(combination)
		const virtualName = generateVirtualName(virtualArticle)
		const configArticle = {}
		Object.assign(configArticle, combination)
		//tmp!!   if (!virtualArticle.includes("null")) {
		configArticle['Сборный артикул'] = virtualArticle
		configArticle['Наименование'] = virtualName
		configArticles.push(configArticle)
		//     }
	})
	const partApiUrl = urlApi.split('/')
	console.log(partApiUrl[partApiUrl.length - 1])
	const file = fileName.find(
		(item) => item.id === partApiUrl[partApiUrl.length - 1],
	)
	saveArrayToExcel(configArticles, `${file.name} с AL рамкой.xlsx`)
})
