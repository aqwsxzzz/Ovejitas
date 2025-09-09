import i18next from "i18next";

export const includeQueryParam = ({
	include,
	withLanguage,
	sex,
	speciesId,
}: {
	include?: string;
	withLanguage: boolean;
	sex?: string;
	speciesId?: string;
}) => {
	const params: Record<string, string> = {};

	if (include) params.include = include;
	if (withLanguage) params.language = i18next.language.slice(0, 2);
	if (sex) params.sex = sex;
	if (speciesId) params.speciesId = speciesId;

	return Object.keys(params).length > 0 ? params : "";
};
