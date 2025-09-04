import { axiosHelper } from "@/lib/axios/axios-helper";
import type { IResponse, IResponseDataArray } from "@/lib/axios";
import type {
	IAnimal,
	IAnimalWithIncludes,
	ICreateAnimalBulkPayload,
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
}: {
	include: string;
	withLanguage: boolean;
	sex?: string;
}) =>
	axiosHelper<IResponse<IAnimal[]>>({
		method: "get",
		url: "/animals",
		urlParams: includeQueryParam(include, withLanguage, sex),
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
	include: string;
	withLanguage: boolean;
}) => {
	type animalWithIncludes = IAnimalWithIncludes<{
		breed: IBreed;
		species: ISpecie;
	}>;
	return axiosHelper<IResponse<animalWithIncludes>>({
		method: "get",
		url: `/animals/${animalId}`,
		urlParams: includeQueryParam(include, withLanguage),
	});
};

export const editAnimalById = ({
	payload,
	farmId,
	animalId,
}: {
	payload: IEditAnimalPayload;
	farmId: string;
	animalId: string;
}) =>
	axiosHelper<IResponse<IAnimal>>({
		method: "put",
		url: `/farms/${farmId}/animals/${animalId}`,
		data: payload,
	});

export const deleteAnimalById = ({
	farmId,
	animalId,
}: {
	farmId: string;
	animalId: string;
}) =>
	axiosHelper<IResponse<IDeleteResponse>>({
		method: "delete",
		url: `/farms/${farmId}/animals/${animalId}`,
	});

export const createAnimalsBulk = ({
	payload,
}: {
	payload: ICreateAnimalBulkPayload;
}) =>
	axiosHelper<IResponseDataArray<IAnimal[]>>({
		method: "post",
		url: `/animals/bulk`,
		data: payload,
	});
