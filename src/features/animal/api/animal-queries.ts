import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	createAnimal,
	createAnimalsBulk,
	deleteAnimalById,
	editAnimalById,
	getAnimalById,
	getAnimalsByFarmId,
	getAnimalsCountBySpecies,
} from "@/features/animal/api/animal-api";
import type {
	IAnimal,
	IAnimalsCountBySpeciesResponse,
	ICreateAnimalBulkPayload,
	ICreateAnimalPayload,
	IEditAnimalPayload,
} from "@/features/animal/types/animal-types";
import { toast } from "sonner";
import type { IResponse } from "@/lib/axios";
import i18next from "i18next";

export const animalQueryKeys = {
	all: ["animal"] as const,
	animalList: (farmId: string, filters?: string[]) =>
		[...animalQueryKeys.all, "list", farmId, filters] as const,
	animalById: (animalId: string) =>
		[...animalQueryKeys.all, "byId", animalId] as const,
	animalsCountBySpecies: (farmId: string, language: string) =>
		[...animalQueryKeys.all, "countBySpecies", farmId, language] as const,
};

export const useGetAnimalsByFarmId = ({
	farmId,
	include,
	withLanguage,
	sex,
	speciesId,
}: {
	farmId: string;
	include?: string;
	withLanguage: boolean;
	sex?: string;
	speciesId?: string;
}) =>
	useQuery({
		queryKey: animalQueryKeys.animalList(farmId, [sex ?? "", speciesId ?? ""]),
		queryFn: () =>
			getAnimalsByFarmId({ include, withLanguage, sex, speciesId }),
		select: (data) => data.data,
		enabled: !!farmId,
		staleTime: 10000, // 10 seconds
	});

export const useCreateAnimal = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			payload,
		}: {
			payload: ICreateAnimalPayload;
			farmId: string;
			sex?: IAnimal["sex"] | "";
			speciesId?: IAnimal["speciesId"] | "";
		}) => createAnimal({ payload }),
		onError: (error) => {
			toast.error(error.message);
		},
		onSuccess: (response, { farmId }) => {
			toast.success("Animal created successfully");

			queryClient.setQueryData<IResponse<IAnimalsCountBySpeciesResponse[]>>(
				animalQueryKeys.animalsCountBySpecies(
					farmId,
					i18next.language.slice(0, 2),
				),

				(oldData) => {
					if (!oldData) {
						return;
					}
					let exist = false;
					const newData = oldData.data.map((item) => {
						if (item.species.id == response.data.speciesId) {
							exist = true;
							return { ...item, count: item.count + 1 };
						}
						return item;
					});

					if (!exist) {
						newData.push({
							count: 1,
							species: {
								id: response.data.speciesId,
								name: response.data.species.translations[0].name,
							},
						});
					}

					return {
						...oldData,
						data: newData,
					};
				},
			);
		},
	});
};

export const useGetAnimalById = ({
	animalId,
	include,
	withLanguage,
}: {
	animalId: string;
	include?: string;
	withLanguage: boolean;
}) =>
	useQuery({
		queryKey: animalQueryKeys.animalById(animalId),
		queryFn: () => getAnimalById({ animalId, include, withLanguage }),
		select: (data) => data.data,
	});

export const useEditAnimalById = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			payload,
			farmId,
			animalId,
		}: {
			payload: IEditAnimalPayload;
			farmId: string;
			animalId: string;
		}) => editAnimalById({ payload, farmId, animalId }),
		onError: (error) => {
			toast.error(error.message);
		},
		onSuccess: (response, { farmId }) => {
			toast.success("Animal edited successfully");
			queryClient.setQueryData<IResponse<IAnimal[]>>(
				animalQueryKeys.animalList(farmId),
				(oldData) => {
					if (!oldData) {
						return;
					}
					return {
						...oldData,
						data: oldData.data.map((animal) =>
							animal.id === response.data.id ? response.data : animal,
						),
					};
				},
			);
		},
	});
};

export const useDeleteAnimalById = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			animalId,
		}: {
			farmId: string;
			animalId: string;
			sex: IAnimal["sex"] | "";
			speciesId: IAnimal["speciesId"] | "";
		}) => deleteAnimalById({ animalId }),
		onError: (error) => {
			toast.error(error.message);
		},
		onSuccess: (_, { farmId, animalId, sex, speciesId }) => {
			toast.success("Animal deleted successfully");
			queryClient.setQueryData<IResponse<IAnimal[]>>(
				animalQueryKeys.animalList(farmId, [sex, speciesId]),

				(oldData) => {
					if (!oldData) {
						return;
					}
					return {
						...oldData,
						data: oldData.data.filter((animal) => animal.id !== animalId),
					};
				},
			);
		},
	});
};

export const useCreateAnimalBulk = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			payload,
		}: {
			payload: ICreateAnimalBulkPayload;
			farmId: string;
		}) => createAnimalsBulk({ payload }),
		onError: (error) => {
			toast.error(error.message);
		},
		onSuccess: (response, { farmId }) => {
			toast.success("Animals created successfully");
			queryClient.setQueryData<IResponse<IAnimal[]>>(
				animalQueryKeys.animalList(farmId),
				(oldData) => {
					if (!oldData) {
						return;
					}
					return {
						...oldData,
						data: [...oldData.data, ...response.data.created],
					};
				},
			);
		},
	});
};

export const useGetAnimalsCountBySpecies = (language: string, farmId: string) =>
	useQuery({
		queryKey: animalQueryKeys.animalsCountBySpecies(farmId, language),
		queryFn: () => getAnimalsCountBySpecies({ language }),
		select: (data) => data.data,
		enabled: !!farmId,
		staleTime: 10000, // 10 seconds
	});
