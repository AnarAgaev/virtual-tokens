import fs from 'fs'
import { analyzeCombinations } from './conf3.js'
import { generateVirtualArticle } from './virtual_article.js'
import { generateVirtualName } from './virtual_name.js'

const combination = {
	'Декоративная рамка': '41004-WH',
	'Светодиодный модуль': '44001-220V-3K',
	Драйвер: 'не выбран',
	Линза: '43002-38',
}

const urlApi = 'https://technolight.ru/api/dots/16'
analyzeCombinations(urlApi).then((combinations) => {
	combinations.forEach((combination) => {
		const virtualArticle = generateVirtualArticle(combination)
		const virtualName = generateVirtualName(combination)
		console.log(virtualArticle)
		console.log(virtualName)
		const partApiUrl = urlApi.split('/')
		fs.appendFileSync(
			`composite_article_${partApiUrl[partApiUrl.length - 1]}.txt`,
			virtualArticle + ' ' + virtualName + '\n',
			'utf8',
		)
	})
})
