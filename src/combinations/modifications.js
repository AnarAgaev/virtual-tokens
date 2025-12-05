import XLSX from 'xlsx';

export const fileName = [
	{ id: "2", name: "симпл 68 и фрейм симпл 68" },
	{ id: "3", name: "симпл 50" },
	{ id: "9", name: "софт 85" },
	{ id: "11", name: "твист 85" },
	{ id: "13", name: "фрейм софт 85" },
	{ id: "15", name: "фрейм твист 85" },
	{ id: "8", name: "софт" },
	{ id: "6", name: "софт мини" },
	{ id: "19", name: "лок 68" }

]

export function setFrameAL(combination) {
	let frameArticle = null;
	let afterDash;
	let beforeDash;
	let result = ''

	for (const step in combination) {
		const article = combination[step];
		if (!article) continue;

		if (article.startsWith('41021') || article.startsWith('41061') || article.startsWith('41041')) {
			frameArticle = article;
			if (!frameArticle) return null;
			const frameParts = frameArticle.split('-');
			if (frameParts.length !== 2) return null;
			beforeDash = frameParts[0];
			afterDash = frameParts[1];
			result = `${beforeDash}-1-${afterDash}`
			// console.log('!!!!!', result)
			combination[step] = result
			return;

		}

	}
	return;
}

export function setNoComplect(combination) {

	for (const step in combination) {
		const article = combination[step];
		if (!article) continue;
		if (article.startsWith('4000') || article.startsWith('5000')) {
			combination[step] = null
			return;

		}

	}
	return;
}

const combination = {
	"Декоративная рамка": "41021-BK",
	"Фиксирующее кольцо": "42001-BK",
	"Светодиодный модуль": "44001-3K",
	"Драйвер": "не выбран",
	"Линза": "43002-38",
	"Монтажный комплект": "40001-89"
};
//setFrameAL(combination)
setNoComplect(combination)


export function saveArrayToExcel(dataArray, filename = 'комбинации_артикулов.xlsx') {
	try {
		if (!dataArray || dataArray.length === 0) {
			console.error('Массив данных пуст');
			return false;
		}

		// Получаем названия колонок из первого объекта
		const columnNames = Object.keys(dataArray[0]);

		// Создаем рабочую книгу
		const workbook = XLSX.utils.book_new();
		const worksheet = XLSX.utils.json_to_sheet(dataArray);

		// Настраиваем ширину колонок
		worksheet['!cols'] = columnNames.map(col => ({
			wch: Math.max(15, Math.min(40, col.length + 5))
		}));

		// Добавляем лист в книгу
		XLSX.utils.book_append_sheet(workbook, worksheet, 'Комбинации');

		// Сохраняем файл
		XLSX.writeFile(workbook, filename);

		console.log(`Файл "${filename}" создан успешно!`);
		console.log(`Записано строк: ${dataArray.length}`);
		console.log(`Колонки: ${columnNames.join(', ')}`);
		return true;

	} catch (error) {
		console.error('Ошибка при создании файла:', error);
		return false;
	}
}