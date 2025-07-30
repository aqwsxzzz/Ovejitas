import i18next from "i18next";

export const includeQueryParam = (include: string, withLanguage: boolean) => {
	const language = i18next.language.slice(0, 2);

	if (include && withLanguage) {
		return { include, language };
	} else if (include) {
		return { include };
	} else if (withLanguage) {
		return { language };
	}

	return "";
};
