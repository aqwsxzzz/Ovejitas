import {
	useInfiniteQuery,
	useMutation,
	useQuery,
	useQueryClient,
	keepPreviousData,
} from "@tanstack/react-query";
import {
	createAnimal,
	createAnimalsBulk,
	deleteAnimalById,
	editAnimalById,
	getAnimalById,
	getAnimalsByFarmId,
	getAnimalsCountBySpecies,
	getAnimalStats,
	searchAnimals,
} from "@/features/animal/api/animal-api";
import type {
	IAnimal,
	IAnimalListFilters,
	IAnimalSearchFilters,
	IAnimalStatsResponse,
	IAnimalsCountBySpeciesResponse,
	ICreateAnimalBulkResponse,
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

const DEFAULT_LIST_PAGE_SIZE = 20;
const LEGACY_LIST_PAGE_SIZE = 100;

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

const isObject = (value: unknown): value is Record<string, unknown> =>
	typeof value === "object" && value !== null;

const isAnimalArray = (value: unknown): value is IAnimal[] =>
	Array.isArray(value);

const isBulkFailedArray = (value: unknown): boolean => Array.isArray(value);

const getRecoverableBulkCreateResponse = (
	error: unknown,
): IResponse<ICreateAnimalBulkResponse> | null => {
	if (!(error instanceof ApiRequestError) || !isObject(error.details)) {
		return null;
	}

	const details = error.details;

	if (isObject(details.data)) {
		const nestedData = details.data;
		if (
			isAnimalArray(nestedData.created) &&
			isBulkFailedArray(nestedData.failed)
		) {
			return {
				status: "success",
				message:
					typeof details.message === "string" ? details.message : error.message,
				data: {
					created: nestedData.created,
					failed: nestedData.failed as ICreateAnimalBulkResponse["failed"],
				},
			};
		}
	}

	if (isAnimalArray(details.created) && isBulkFailedArray(details.failed)) {
		return {
			status: "success",
			message:
				typeof details.message === "string" ? details.message : error.message,
			data: {
				created: details.created,
				failed: details.failed as ICreateAnimalBulkResponse["failed"],
			},
		};
	}

	return null;
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
	animalListPage: (
		farmId: string,
		filters: Partial<IAnimalListFilters> | undefined,
		limit: number,
	) => [...animalQueryKeys.animalList(farmId, filters), "page", limit] as const,
	animalById: (animalId: string) =>
		[...animalQueryKeys.all, "byId", animalId] as const,
	animalStats: (farmId: string, language: string) =>
		[...animalQueryKeys.all, "stats", farmId, language] as const,
	animalsCountBySpecies: (farmId: string, language: string) =>
		[...animalQueryKeys.all, "countBySpecies", farmId, language] as const,
	animalSearch: (filters: IAnimalSearchFilters, limit: number) =>
		[
			...animalQueryKeys.all,
			"search",
			filters.q,
			filters.sex ?? "",
			filters.speciesId ?? "",
			limit,
		] as const,
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
				page: 1,
				limit: LEGACY_LIST_PAGE_SIZE,
			}),
		select: (data) => data.data,
		enabled: !!farmId,
		staleTime: 10000, // 10 seconds
	});

export const useGetInfiniteAnimalsByFarmId = ({
	farmId,
	include,
	withLanguage,
	filters,
	limit = DEFAULT_LIST_PAGE_SIZE,
}: {
	farmId: string;
	include?: string;
	withLanguage: boolean;
	filters?: Partial<IAnimalListFilters>;
	limit?: number;
}) =>
	useInfiniteQuery({
		queryKey: animalQueryKeys.animalListPage(farmId, filters, limit),
		queryFn: ({ pageParam }) =>
			getAnimalsByFarmId({
				include,
				withLanguage,
				sex: filters?.sex,
				speciesId: filters?.speciesId,
				page: pageParam,
				limit,
			}),
		initialPageParam: 1,
		getNextPageParam: (lastPage) => {
			const pagination = lastPage.meta?.pagination;
			if (!pagination) {
				return undefined;
			}

			return pagination.page < pagination.totalPages
				? pagination.page + 1
				: undefined;
		},
		select: (data) => {
			const items = data.pages.flatMap((page) => page.data);
			const latestPagination = data.pages.at(-1)?.meta?.pagination;

			return {
				items,
				total: latestPagination?.total ?? items.length,
				totalPages: latestPagination?.totalPages ?? 1,
			};
		},
		enabled: !!farmId,
		staleTime: 10000,
	});

export const useGetAnimalsByFarmIdPage = ({
	farmId,
	include,
	withLanguage,
	filters,
	page,
	limit,
	enabled = true,
}: {
	farmId: string;
	include?: string;
	withLanguage: boolean;
	filters?: Partial<IAnimalListFilters>;
	page: number;
	limit: number;
	enabled?: boolean;
}) =>
	useQuery({
		queryKey: [
			...animalQueryKeys.animalList(farmId, filters),
			"paged",
			page,
			limit,
		],
		queryFn: () =>
			getAnimalsByFarmId({
				include,
				withLanguage,
				sex: filters?.sex,
				speciesId: filters?.speciesId,
				page,
				limit,
			}),
		select: (data) => {
			const pagination = data.meta?.pagination;

			return {
				items: data.data,
				page: pagination?.page ?? page,
				limit: pagination?.limit ?? limit,
				total: pagination?.total ?? data.data.length,
				totalPages: pagination?.totalPages ?? 1,
			};
		},
		enabled: !!farmId && enabled,
		staleTime: 10000,
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
						const createdSpeciesName =
							response.data.species?.translations?.[0]?.name ??
							response.data.speciesId;

						newData.push({
							count: 1,
							species: {
								id: response.data.speciesId,
								name: createdSpeciesName,
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

			void queryClient.invalidateQueries({
				queryKey: [...animalQueryKeys.all, "stats", farmId],
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
			animalId,
		}: {
			payload: IEditAnimalPayload;
			farmId: string;
			animalId: string;
			filters?: Partial<IAnimalListFilters>;
		}) => editAnimalById({ payload, animalId }),
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

			void queryClient.invalidateQueries({
				queryKey: [...animalQueryKeys.all, "list", farmId],
			});
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

			void queryClient.invalidateQueries({
				queryKey: [...animalQueryKeys.all, "list", farmId],
			});

			void queryClient.invalidateQueries({
				queryKey: [...animalQueryKeys.all, "stats", farmId],
			});
		},
	});
};

export const useCreateAnimalBulk = () => {
	const queryClient = useQueryClient();

	return useMutation({
		onMutate: ({ farmId, filters }) => {
			const currentAnimalList = queryClient.getQueryData<IResponse<IAnimal[]>>(
				animalQueryKeys.animalList(farmId, filters),
			);

			return {
				previousAnimalCount: currentAnimalList?.data.length,
			};
		},
		mutationFn: async ({
			payload,
		}: {
			payload: ICreateAnimalBulkPayload;
			farmId: string;
			filters?: Partial<IAnimalListFilters>;
		}) => {
			try {
				return await createAnimalsBulk({ payload });
			} catch (error) {
				const recoverableResponse = getRecoverableBulkCreateResponse(error);

				if (recoverableResponse) {
					return recoverableResponse;
				}

				throw error;
			}
		},
		onError: async (error, { farmId, filters }, context) => {
			const isPotentialFalseConflictError =
				error instanceof ApiRequestError &&
				(error.code === "conflict_error" ||
					includesAny(error.message.toLowerCase(), [
						"already exists",
						"duplicate",
						"duplicated",
						"ya existe",
						"duplicado",
					]));

			if (isPotentialFalseConflictError) {
				void queryClient.invalidateQueries({
					queryKey: [...animalQueryKeys.all, "list", farmId],
				});

				void queryClient.invalidateQueries({
					queryKey: [...animalQueryKeys.all, "countBySpecies", farmId],
				});

				const refreshedAnimalList = await queryClient.fetchQuery({
					queryKey: animalQueryKeys.animalList(farmId, filters),
					queryFn: () =>
						getAnimalsByFarmId({
							withLanguage: true,
							sex: filters?.sex,
							speciesId: filters?.speciesId,
							page: 1,
							limit: LEGACY_LIST_PAGE_SIZE,
						}),
				});

				const previousCount = context?.previousAnimalCount;
				const currentCount = refreshedAnimalList.data.length;

				if (typeof previousCount === "number" && currentCount > previousCount) {
					const createdCount = currentCount - previousCount;
					toast.success(
						i18next.t("newAnimalModal:toast.bulkCreatePartialSuccess", {
							createdCount,
							failedCount: 0,
						}),
					);
					return;
				}
			}

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

			queryClient.setQueryData<IResponse<IAnimalsCountBySpeciesResponse[]>>(
				animalQueryKeys.animalsCountBySpecies(
					farmId,
					i18next.language.slice(0, 2),
				),
				(oldData) => {
					if (!oldData) {
						return;
					}

					const countsBySpecies = response.data.created.reduce<
						Record<string, { count: number; name: string }>
					>((acc, animal) => {
						const speciesId = animal.speciesId;
						const speciesName =
							animal.species?.translations?.[0]?.name ?? speciesId;

						if (!acc[speciesId]) {
							acc[speciesId] = { count: 0, name: speciesName };
						}

						acc[speciesId].count += 1;
						if (!acc[speciesId].name && speciesName) {
							acc[speciesId].name = speciesName;
						}

						return acc;
					}, {});

					const newData = [...oldData.data];

					for (const [speciesId, value] of Object.entries(countsBySpecies)) {
						const existingIndex = newData.findIndex(
							(item) => item.species.id === speciesId,
						);

						if (existingIndex >= 0) {
							newData[existingIndex] = {
								...newData[existingIndex],
								count: newData[existingIndex].count + value.count,
							};
							continue;
						}

						newData.push({
							count: value.count,
							species: {
								id: speciesId,
								name: value.name,
							},
						});
					}

					return {
						...oldData,
						data: newData,
					};
				},
			);

			void queryClient.invalidateQueries({
				queryKey: [...animalQueryKeys.all, "list", farmId],
			});

			void queryClient.invalidateQueries({
				queryKey: [...animalQueryKeys.all, "countBySpecies", farmId],
			});

			void queryClient.invalidateQueries({
				queryKey: [...animalQueryKeys.all, "stats", farmId],
			});
		},
	});
};

export const useGetAnimalStats = (farmId: string) => {
	const language = i18next.language.slice(0, 2);

	return useQuery({
		queryKey: animalQueryKeys.animalStats(farmId, language),
		queryFn: () => getAnimalStats({ language }),
		select: (data): IAnimalStatsResponse => data.data,
		enabled: !!farmId,
		staleTime: 10000,
	});
};

export const useSearchAnimalsPaged = ({
	filters,
	include,
	page,
	limit,
}: {
	filters: IAnimalSearchFilters;
	include?: string;
	page: number;
	limit: number;
}) => {
	const language = i18next.language.slice(0, 2);

	return useQuery({
		queryKey: [...animalQueryKeys.animalSearch(filters, limit), "paged", page],
		queryFn: () =>
			searchAnimals({
				q: filters.q,
				language,
				include,
				sex: filters.sex,
				speciesId: filters.speciesId,
				page,
				limit,
			}),
		select: (data) => {
			const pagination = data.meta?.pagination;

			return {
				items: data.data,
				page: pagination?.page ?? page,
				limit: pagination?.limit ?? limit,
				total: pagination?.total ?? data.data.length,
				totalPages: pagination?.totalPages ?? 1,
			};
		},
		enabled: filters.q.length > 0,
		placeholderData: keepPreviousData,
		staleTime: 10000,
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

export const useInfiniteSearchAnimals = ({
	filters,
	include,
	limit = DEFAULT_LIST_PAGE_SIZE,
}: {
	filters: IAnimalSearchFilters;
	include?: string;
	limit?: number;
}) => {
	const language = i18next.language.slice(0, 2);

	return useInfiniteQuery({
		queryKey: animalQueryKeys.animalSearch(filters, limit),
		queryFn: ({ pageParam }) =>
			searchAnimals({
				q: filters.q,
				language,
				include,
				sex: filters.sex,
				speciesId: filters.speciesId,
				page: pageParam,
				limit,
			}),
		initialPageParam: 1,
		getNextPageParam: (lastPage) => {
			const pagination = lastPage.meta?.pagination;
			if (!pagination) {
				return undefined;
			}
			return pagination.page < pagination.totalPages
				? pagination.page + 1
				: undefined;
		},
		select: (data) => {
			const items = data.pages.flatMap((page) => page.data);
			const latestPagination = data.pages.at(-1)?.meta?.pagination;

			return {
				items,
				total: latestPagination?.total ?? items.length,
				totalPages: latestPagination?.totalPages ?? 1,
			};
		},
		enabled: filters.q.length > 0,
		staleTime: 10000,
	});
};
