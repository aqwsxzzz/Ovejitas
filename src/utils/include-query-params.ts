import i18next from "i18next";

export const includeQueryParam = (
	include: string,
	withLanguage: boolean,
	sex?: string,
) => {
	const language = i18next.language.slice(0, 2);

	if (include && withLanguage && sex) {
		return { include, language, sex };
	} else if (include && sex) {
		return { include, sex };
	} else if (include && withLanguage) {
		return { include, language };
	} else if (withLanguage && sex) {
		return { language, sex };
	} else if (withLanguage) {
		return { language };
	}

	return "";
};
