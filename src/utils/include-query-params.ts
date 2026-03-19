import i18next from "i18next";

export const includeQueryParam = ({
	include,
	withLanguage,
	sex,
	speciesId,
	page,
	limit,
}: {
	include?: string;
	withLanguage: boolean;
	sex?: string;
	speciesId?: string;
	page?: number;
	limit?: number;
}) => {
	const params: Record<string, string> = {};

	if (include) params.include = include;
	if (withLanguage) params.language = i18next.language.slice(0, 2);
	if (sex) params.sex = sex;
	if (speciesId) params.speciesId = speciesId;
	if (typeof page === "number") params.page = String(page);
	if (typeof limit === "number") params.limit = String(limit);

	return Object.keys(params).length > 0 ? params : "";
};
