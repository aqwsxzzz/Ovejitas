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
	IAnimalListFilters,
	IAnimalsCountBySpeciesResponse,
	ICreateAnimalBulkPayload,
	ICreateAnimalPayload,
	IEditAnimalPayload,
} from "@/features/animal/types/animal-types";
import { toast } from "sonner";
import type { IResponse } from "@/lib/axios";
import i18next from "i18next";
import { ApiRequestError } from "@/lib/axios/axios-helper";

const normalizeFilters = (filters?: Partial<IAnimalListFilters>): string[] => {
	return [filters?.sex ?? "", filters?.speciesId ?? ""];
};

const includesAny = (value: string, patterns: string[]): boolean =>
	patterns.some((pattern) => value.includes(pattern));

const getAnimalCreateErrorToastMessage = (
	error: unknown,
	mode: "single" | "bulk",
): string => {
	const genericKey =
		mode === "single" ? "toast.createError" : "toast.bulkCreateError";

	if (!(error instanceof ApiRequestError)) {
		return i18next.t(`newAnimalModal:${genericKey}`);
	}

	const normalizedMessage = error.message.toLowerCase();

	if (error.code === "network_error") {
		return i18next.t("newAnimalModal:toast.errors.network");
	}

	if (error.code === "unauthorized_error") {
		return i18next.t("newAnimalModal:toast.errors.unauthorized");
	}

	if (error.code === "forbidden_error") {
		return i18next.t("newAnimalModal:toast.errors.forbidden");
	}

	if (
		error.code === "conflict_error" ||
		includesAny(normalizedMessage, [
			"already exists",
			"duplicate",
			"duplicated",
			"ya existe",
			"duplicado",
		])
	) {
		return i18next.t(
			mode === "single"
				? "newAnimalModal:toast.errors.tagAlreadyExists"
				: "newAnimalModal:toast.errors.bulkTagsAlreadyExist",
		);
	}

	if (includesAny(normalizedMessage, ["breed", "raza"])) {
		return i18next.t("newAnimalModal:toast.errors.invalidBreed");
	}

	if (includesAny(normalizedMessage, ["species", "specie", "especie"])) {
		return i18next.t("newAnimalModal:toast.errors.invalidSpecies");
	}

	if (error.code === "validation_error") {
		return i18next.t(
			mode === "single"
				? "newAnimalModal:toast.errors.singleValidation"
				: "newAnimalModal:toast.errors.bulkValidation",
		);
	}

	return i18next.t(`newAnimalModal:${genericKey}`);
};

export const animalQueryKeys = {
	all: ["animal"] as const,
	animalList: (farmId: string, filters?: Partial<IAnimalListFilters>) =>
		[
			...animalQueryKeys.all,
			"list",
			farmId,
			normalizeFilters(filters),
		] as const,
	animalById: (animalId: string) =>
		[...animalQueryKeys.all, "byId", animalId] as const,
	animalsCountBySpecies: (farmId: string, language: string) =>
		[...animalQueryKeys.all, "countBySpecies", farmId, language] as const,
};

export const useGetAnimalsByFarmId = ({
	farmId,
	include,
	withLanguage,
	filters,
}: {
	farmId: string;
	include?: string;
	withLanguage: boolean;
	filters?: Partial<IAnimalListFilters>;
}) =>
	useQuery({
		queryKey: animalQueryKeys.animalList(farmId, filters),
		queryFn: () =>
			getAnimalsByFarmId({
				include,
				withLanguage,
				sex: filters?.sex,
				speciesId: filters?.speciesId,
			}),
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
			filters?: Partial<IAnimalListFilters>;
		}) => createAnimal({ payload }),
		onError: (error) => {
			toast.error(getAnimalCreateErrorToastMessage(error, "single"));
		},
		onSuccess: (response, { farmId, filters }) => {
			toast.success(i18next.t("newAnimalModal:toast.createSuccess"));

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

			queryClient.setQueryData<IResponse<IAnimal[]>>(
				animalQueryKeys.animalList(farmId, filters),
				(oldData) => {
					if (!oldData) {
						return;
					}
					return {
						...oldData,
						data: [...oldData.data, response.data],
					};
				},
			);

			void queryClient.invalidateQueries({
				queryKey: [...animalQueryKeys.all, "list", farmId],
			});
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
			filters?: Partial<IAnimalListFilters>;
		}) => editAnimalById({ payload, farmId, animalId }),
		onError: (error) => {
			toast.error(error.message);
		},
		onSuccess: (response, { farmId, filters }) => {
			toast.success("Animal edited successfully");
			queryClient.setQueryData<IResponse<IAnimal[]>>(
				animalQueryKeys.animalList(farmId, filters),
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
			filters?: Partial<IAnimalListFilters>;
		}) => deleteAnimalById({ animalId }),
		onError: (error) => {
			toast.error(error.message);
		},
		onSuccess: (_, { farmId, animalId, filters }) => {
			toast.success(i18next.t("deleteAnimalModal:toast.deleteSuccess"));
			queryClient.setQueryData<IResponse<IAnimal[]>>(
				animalQueryKeys.animalList(farmId, filters),

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
			filters?: Partial<IAnimalListFilters>;
		}) => createAnimalsBulk({ payload }),
		onError: (error) => {
			toast.error(getAnimalCreateErrorToastMessage(error, "bulk"));
		},
		onSuccess: (response, { farmId, filters }) => {
			const createdCount = response.data.created.length;
			const failedCount = response.data.failed.length;

			if (failedCount > 0) {
				toast.success(
					i18next.t("newAnimalModal:toast.bulkCreatePartialSuccess", {
						createdCount,
						failedCount,
					}),
				);
			} else {
				toast.success(i18next.t("newAnimalModal:toast.bulkCreateSuccess"));
			}

			queryClient.setQueryData<IResponse<IAnimal[]>>(
				animalQueryKeys.animalList(farmId, filters),
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

			void queryClient.invalidateQueries({
				queryKey: [...animalQueryKeys.all, "list", farmId],
			});
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
