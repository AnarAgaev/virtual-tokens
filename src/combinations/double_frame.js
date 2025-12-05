export function getDoubleFrameCode(combination) {
	for (const step in combination) {
		const article = combination[step];
		if (article && (article.startsWith('41007') || article.startsWith('41008')) && article.includes('-')) {
			return ` (2 шт)+ ${article}`;
		}
	}
	return '';
}