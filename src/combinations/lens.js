export function getLensCode(combination) {
	for (const step in combination) {
		const article = combination[step];
		if (article?.startsWith('43') && article.includes('-')) {
			const parts = article.split('-');
			const before = parts[0].slice(-2);
			const after = parts[1].slice(0, 2);
			return before + after;
		}
	}
	return null;
}