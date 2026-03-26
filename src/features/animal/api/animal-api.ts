import { axiosHelper } from "@/lib/axios/axios-helper";
import type { IResponse } from "@/lib/axios";
import type {
	IAnimal,
	IAnimalStatsResponse,
	IAnimalsCountBySpeciesResponse,
	IAnimalWithIncludes,
	ICreateAnimalBulkPayload,
	ICreateAnimalBulkResponse,
	ICreateAnimalPayload,
	IDeleteResponse,
	IEditAnimalPayload,
} from "@/features/animal/types/animal-types";
import { includeQueryParam } from "@/utils/include-query-params";
import type { IBreed } from "@/features/breed/types/breed-types";
import type { ISpecie } from "@/features/specie/types/specie-types";

export const getAnimalsByFarmId = ({
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
}) =>
	axiosHelper<IResponse<IAnimal[]>>({
		method: "get",
		url: "/animals",
		urlParams: includeQueryParam({
			include,
			withLanguage,
			sex,
			speciesId,
			page,
			limit,
		}),
	});

export const createAnimal = ({ payload }: { payload: ICreateAnimalPayload }) =>
	axiosHelper<IResponse<IAnimal>>({
		method: "post",
		url: "/animals",
		data: payload,
	});

export const getAnimalById = ({
	animalId,
	include,
	withLanguage,
}: {
	animalId: string;
	include?: string;
	withLanguage: boolean;
}) => {
	type animalWithIncludes = IAnimalWithIncludes<{
		breed: IBreed;
		species: ISpecie;
	}>;
	return axiosHelper<IResponse<animalWithIncludes>>({
		method: "get",
		url: `/animals/${animalId}`,
		urlParams: includeQueryParam({ include, withLanguage }),
	});
};

export const editAnimalById = ({
	payload,
	animalId,
}: {
	payload: IEditAnimalPayload;
	animalId: string;
}) =>
	axiosHelper<IResponse<IAnimal>>({
		method: "put",
		url: `/animals/${animalId}`,
		data: payload,
	});

export const deleteAnimalById = ({ animalId }: { animalId: string }) =>
	axiosHelper<IResponse<IDeleteResponse>>({
		method: "delete",
		url: `/animals/${animalId}`,
	});

export const createAnimalsBulk = ({
	payload,
}: {
	payload: ICreateAnimalBulkPayload;
}) =>
	axiosHelper<IResponse<ICreateAnimalBulkResponse>>({
		method: "post",
		url: `/animals/bulk`,
		data: payload,
	});

export const getAnimalsCountBySpecies = ({ language }: { language: string }) =>
	axiosHelper<IResponse<IAnimalsCountBySpeciesResponse[]>>({
		method: "get",
		url: `/animals/dashboard`,
		urlParams: { language },
	});

export const getAnimalStats = ({ language }: { language: string }) =>
	axiosHelper<IResponse<IAnimalStatsResponse>>({
		method: "get",
		url: `/animals/stats`,
		urlParams: { language },
	});

export const searchAnimals = ({
	q,
	language,
	include,
	sex,
	speciesId,
	page,
	limit,
}: {
	q: string;
	language: string;
	include?: string;
	sex?: string;
	speciesId?: string;
	page?: number;
	limit?: number;
}) => {
	const params: Record<string, string> = { q, language };
	if (include) params.include = include;
	if (sex) params.sex = sex;
	if (speciesId) params.speciesId = speciesId;
	if (typeof page === "number") params.page = String(page);
	if (typeof limit === "number") params.limit = String(limit);

	return axiosHelper<IResponse<IAnimal[]>>({
		method: "get",
		url: `/animals/search`,
		urlParams: params,
	});
};
