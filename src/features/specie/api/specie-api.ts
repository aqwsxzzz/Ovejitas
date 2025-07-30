import { axiosHelper } from "@/lib/axios/axios-helper";
import type { ISpecie } from "@/features/specie/types/specie-types";
import type { IResponse } from "@/lib/axios";
import { includeQueryParam } from "@/utils/include-query-params";

export const getSpecies = ({
	include,
	withLanguage,
}: {
	include: string;
	withLanguage: boolean;
}) => {
	return axiosHelper<IResponse<ISpecie[]>>({
		method: "get",
		url: "/species?include=translations",
		urlParams: includeQueryParam(include, withLanguage),
	});
};
