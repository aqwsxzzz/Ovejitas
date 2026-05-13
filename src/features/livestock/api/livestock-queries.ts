import {
	useInfiniteQuery,
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import {
	listEventCategoriesByFarmId,
	listEventsByAssetId,
	getLivestockAssetById,
	listLivestockAssetsByFarmId,
	listIndividualsByAssetId,
	getIndividualById,
	getProfitabilityReport,
	getProductionReport,
	getCostPerUnitReport,
	createEventByAssetId,
	updateEventByAssetId,
	deleteEventByAssetId,
	createIndividual,
	updateIndividual,
	deleteIndividual,
	createEventCategoryByFarmId,
	updateEventCategoryById,
	deleteEventCategoryById,
	createLivestockAsset,
	updateLivestockAssetById,
	deleteLivestockAssetById,
	type LivestockEventCreatePayload,
	type LivestockEventUpdatePayload,
} from "@/features/livestock/api/livestock-api";
import type {
	ILivestockAsset,
	ILivestockEventCategory,
	ILivestockIndividual,
	ILivestockIndividualListResponse,
	LivestockEventType,
	LivestockAssetKind,
	LivestockAssetMode,
	LivestockEventUnit,
	ReportBucket,
} from "@/features/livestock/types/livestock-types";

function appendIndividualToListCache(
	current: ILivestockIndividualListResponse | undefined,
	created: ILivestockIndividual,
): ILivestockIndividualListResponse | undefined {
	if (!current) return current;
	if (current.data.some((individual) => individual.id === created.id)) {
		return current;
	}

	return {
		...current,
		data: [created, ...current.data],
		meta: {
			...current.meta,
			total: current.meta.total + 1,
		},
	};
}

function replaceIndividualInListCache(
	current: ILivestockIndividualListResponse | undefined,
	updated: ILivestockIndividual,
): ILivestockIndividualListResponse | undefined {
	if (!current) return current;

	return {
		...current,
		data: current.data.map((individual) =>
			individual.id === updated.id ? updated : individual,
		),
	};
}

function removeIndividualFromListCache(
	current: ILivestockIndividualListResponse | undefined,
	individualId: string,
): ILivestockIndividualListResponse | undefined {
	if (!current) return current;

	const nextData = current.data.filter(
		(individual) => String(individual.id) !== individualId,
	);

	if (nextData.length === current.data.length) {
		return current;
	}

	return {
		...current,
		data: nextData,
		meta: {
			...current.meta,
			total: Math.max(0, current.meta.total - 1),
		},
	};
}

interface ListLivestockAssetsFilters {
	q?: string;
	sort?: string;
	dateFrom?: string;
	dateTo?: string;
	kind?: LivestockAssetKind;
	mode?: LivestockAssetMode;
	page?: number;
	pageSize?: number;
}

interface ListIndividualsFilters {
	q?: string;
	sort?: string;
	status?: ILivestockIndividual["status"];
	dateFrom?: string;
	dateTo?: string;
	page?: number;
	pageSize?: number;
}

interface ListEventsFilters {
	q?: string;
	sort?: string;
	type?: LivestockEventType;
	categoryId?: number;
	individualId?: number;
	page?: number;
	pageSize?: number;
}

interface ListEventCategoriesFilters {
	q?: string;
	sort?: string;
	type?: LivestockEventType;
	archived?: boolean;
	page?: number;
	pageSize?: number;
}

export const livestockQueryKeys = {
	all: ["livestock"] as const,
	assetsByFarm: (farmId: string, filters?: ListLivestockAssetsFilters) =>
		[
			...livestockQueryKeys.all,
			"assetsByFarm",
			farmId,
			filters?.q ?? "",
			filters?.sort ?? "",
			filters?.dateFrom ?? "",
			filters?.dateTo ?? "",
			filters?.kind ?? "",
			filters?.mode ?? "",
			filters?.page ?? 1,
			filters?.pageSize ?? 20,
		] as const,
	assetById: (farmId: string, assetId: number) =>
		[...livestockQueryKeys.all, "assetById", farmId, assetId] as const,
	individualsByAsset: (
		farmId: string,
		assetId: string,
		filters?: ListIndividualsFilters,
	) =>
		[
			...livestockQueryKeys.all,
			"individualsByAsset",
			farmId,
			assetId,
			filters?.q ?? "",
			filters?.sort ?? "",
			filters?.status ?? "",
			filters?.dateFrom ?? "",
			filters?.dateTo ?? "",
			filters?.page ?? 1,
			filters?.pageSize ?? 20,
		] as const,
	individualById: (farmId: string, assetId: string, individualId: string) =>
		[
			...livestockQueryKeys.all,
			"individualById",
			farmId,
			assetId,
			individualId,
		] as const,
	eventsByAsset: (
		farmId: string,
		assetId: string,
		filters?: ListEventsFilters,
	) =>
		[
			...livestockQueryKeys.all,
			"eventsByAsset",
			farmId,
			assetId,
			filters?.q ?? "",
			filters?.sort ?? "",
			filters?.type ?? "",
			filters?.categoryId ?? "",
			filters?.individualId ?? "",
			filters?.page ?? 1,
			filters?.pageSize ?? 20,
		] as const,
	eventsByAssetInfinite: (
		farmId: string,
		assetId: string,
		filters?: Omit<ListEventsFilters, "page" | "pageSize">,
		pageSize = 20,
	) =>
		[
			...livestockQueryKeys.all,
			"eventsByAssetInfinite",
			farmId,
			assetId,
			filters?.q ?? "",
			filters?.sort ?? "",
			filters?.type ?? "",
			filters?.categoryId ?? "",
			filters?.individualId ?? "",
			pageSize,
		] as const,
	eventCategoriesByFarm: (
		farmId: string,
		filters?: ListEventCategoriesFilters,
	) =>
		[
			...livestockQueryKeys.all,
			"eventCategoriesByFarm",
			farmId,
			filters?.q ?? "",
			filters?.sort ?? "",
			filters?.type ?? "",
			filters?.archived ?? false,
			filters?.page ?? 1,
			filters?.pageSize ?? 100,
		] as const,
	profitabilityReport: (
		farmId: string,
		assetId?: number,
		dateFrom?: string,
		dateTo?: string,
	) =>
		[
			...livestockQueryKeys.all,
			"profitabilityReport",
			farmId,
			assetId ?? "",
			dateFrom ?? "",
			dateTo ?? "",
		] as const,
	productionReport: (
		farmId: string,
		assetId?: number,
		type?: LivestockEventType,
		unit?: LivestockEventUnit,
		bucket?: ReportBucket,
		dateFrom?: string,
		dateTo?: string,
	) =>
		[
			...livestockQueryKeys.all,
			"productionReport",
			farmId,
			assetId ?? "",
			type ?? "production",
			unit ?? "",
			bucket ?? "day",
			dateFrom ?? "",
			dateTo ?? "",
		] as const,
	costPerUnitReport: (
		farmId: string,
		unit: LivestockEventUnit,
		assetId?: number,
		dateFrom?: string,
		dateTo?: string,
	) =>
		[
			...livestockQueryKeys.all,
			"costPerUnitReport",
			farmId,
			unit,
			assetId ?? "",
			dateFrom ?? "",
			dateTo ?? "",
		] as const,
};

export const useListLivestockAssetsByFarmId = ({
	farmId,
	filters,
	enabled = true,
}: {
	farmId: string;
	filters?: ListLivestockAssetsFilters;
	enabled?: boolean;
}) =>
	useQuery({
		queryKey: livestockQueryKeys.assetsByFarm(farmId, filters),
		queryFn: () => listLivestockAssetsByFarmId({ farmId, filters }),
		enabled: enabled && !!farmId,
	});

export const useGetLivestockAssetById = ({
	farmId,
	assetId,
	enabled = true,
}: {
	farmId: string;
	assetId: number;
	enabled?: boolean;
}) =>
	useQuery<ILivestockAsset>({
		queryKey: livestockQueryKeys.assetById(farmId, assetId),
		queryFn: () => getLivestockAssetById({ farmId, assetId }),
		enabled: enabled && !!farmId && Number.isFinite(assetId),
	});

export const useListIndividualsByAssetId = ({
	farmId,
	assetId,
	filters,
	enabled = true,
}: {
	farmId: string;
	assetId: string;
	filters?: ListIndividualsFilters;
	enabled?: boolean;
}) =>
	useQuery({
		queryKey: livestockQueryKeys.individualsByAsset(farmId, assetId, filters),
		queryFn: () => listIndividualsByAssetId({ farmId, assetId, filters }),
		enabled: enabled && !!farmId && !!assetId,
	});

export const useGetIndividualById = ({
	farmId,
	assetId,
	individualId,
	enabled = true,
}: {
	farmId: string;
	assetId: string;
	individualId: string;
	enabled?: boolean;
}) =>
	useQuery<ILivestockIndividual>({
		queryKey: livestockQueryKeys.individualById(farmId, assetId, individualId),
		queryFn: () => getIndividualById({ farmId, assetId, individualId }),
		enabled: enabled && !!farmId && !!assetId && !!individualId,
	});

export const useListEventsByAssetId = ({
	farmId,
	assetId,
	filters,
	enabled = true,
}: {
	farmId: string;
	assetId: string;
	filters?: ListEventsFilters;
	enabled?: boolean;
}) =>
	useQuery({
		queryKey: livestockQueryKeys.eventsByAsset(farmId, assetId, filters),
		queryFn: () => listEventsByAssetId({ farmId, assetId, filters }),
		enabled: enabled && !!farmId && !!assetId,
	});

export const useListInfiniteEventsByAssetId = ({
	farmId,
	assetId,
	filters,
	pageSize = 20,
	enabled = true,
}: {
	farmId: string;
	assetId: string;
	filters?: Omit<ListEventsFilters, "page" | "pageSize">;
	pageSize?: number;
	enabled?: boolean;
}) =>
	useInfiniteQuery({
		queryKey: livestockQueryKeys.eventsByAssetInfinite(
			farmId,
			assetId,
			filters,
			pageSize,
		),
		queryFn: ({ pageParam }) =>
			listEventsByAssetId({
				farmId,
				assetId,
				filters: {
					...filters,
					page: pageParam,
					pageSize,
				},
			}),
		initialPageParam: 1,
		getNextPageParam: (lastPage) =>
			lastPage.meta.has_next ? lastPage.meta.page + 1 : undefined,
		select: (data) => ({
			items: data.pages.flatMap((page) => page.data),
			total: data.pages.at(-1)?.meta.total ?? 0,
		}),
		enabled: enabled && !!farmId && !!assetId,
	});

export const useListEventCategoriesByFarmId = ({
	farmId,
	filters,
	enabled = true,
}: {
	farmId: string;
	filters?: ListEventCategoriesFilters;
	enabled?: boolean;
}) =>
	useQuery<ILivestockEventCategory[]>({
		queryKey: livestockQueryKeys.eventCategoriesByFarm(farmId, filters),
		queryFn: async () => {
			const result = await listEventCategoriesByFarmId({ farmId, filters });
			return result.data;
		},
		enabled: enabled && !!farmId,
	});

// --- Report hooks ---

interface ReportBaseFilters {
	assetId?: number;
	dateFrom?: string;
	dateTo?: string;
}

export const useGetProfitabilityReport = ({
	farmId,
	filters,
	enabled = true,
}: {
	farmId: string;
	filters?: ReportBaseFilters;
	enabled?: boolean;
}) =>
	useQuery({
		queryKey: livestockQueryKeys.profitabilityReport(
			farmId,
			filters?.assetId,
			filters?.dateFrom,
			filters?.dateTo,
		),
		queryFn: () => getProfitabilityReport({ farmId, filters }),
		enabled: enabled && !!farmId,
	});

interface ProductionReportFilters extends ReportBaseFilters {
	type?: LivestockEventType;
	unit?: LivestockEventUnit;
	bucket?: ReportBucket;
}

export const useGetProductionReport = ({
	farmId,
	filters,
	enabled = true,
}: {
	farmId: string;
	filters?: ProductionReportFilters;
	enabled?: boolean;
}) =>
	useQuery({
		queryKey: livestockQueryKeys.productionReport(
			farmId,
			filters?.assetId,
			filters?.type,
			filters?.unit,
			filters?.bucket,
			filters?.dateFrom,
			filters?.dateTo,
		),
		queryFn: () => getProductionReport({ farmId, filters }),
		enabled: enabled && !!farmId,
	});

interface CostPerUnitReportFilters extends ReportBaseFilters {
	unit: LivestockEventUnit;
}

export const useGetCostPerUnitReport = ({
	farmId,
	filters,
	enabled = true,
}: {
	farmId: string;
	filters: CostPerUnitReportFilters;
	enabled?: boolean;
}) =>
	useQuery({
		queryKey: livestockQueryKeys.costPerUnitReport(
			farmId,
			filters.unit,
			filters.assetId,
			filters.dateFrom,
			filters.dateTo,
		),
		queryFn: () => getCostPerUnitReport({ farmId, filters }),
		enabled: enabled && !!farmId,
	});

export const useGetAggregatedHeadcountByAssetId = ({
	farmId,
	assetId,
	enabled = true,
}: {
	farmId: string;
	assetId: string;
	enabled?: boolean;
}) =>
	useQuery({
		queryKey: [
			...livestockQueryKeys.all,
			"aggregatedHeadcount",
			farmId,
			assetId,
		],
		queryFn: async () => {
			const pageSize = 100;

			const sumQuantityByType = async (
				type: Extract<LivestockEventType, "acquisition" | "mortality">,
			): Promise<number> => {
				let page = 1;
				let total = 0;

				while (true) {
					const response = await listEventsByAssetId({
						farmId,
						assetId,
						filters: {
							type,
							page,
							pageSize,
						},
					});

					for (const event of response.data) {
						total += Number(event.quantity ?? 0) || 0;
					}

					if (!response.meta.has_next) {
						break;
					}

					page = response.meta.page + 1;
				}

				return total;
			};

			const [acquisitionTotal, mortalityTotal] = await Promise.all([
				sumQuantityByType("acquisition"),
				sumQuantityByType("mortality"),
			]);

			return {
				acquisitionTotal,
				mortalityTotal,
				net: Math.max(acquisitionTotal - mortalityTotal, 0),
			};
		},
		enabled: enabled && !!farmId && !!assetId,
	});

// --- Mutation Hooks ---

export const useCreateEventByAssetId = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			farmId,
			assetId,
			data,
		}: {
			farmId: string;
			assetId: string;
			data: LivestockEventCreatePayload;
		}) => createEventByAssetId({ farmId, assetId, data }),
		onSuccess: (_, { farmId, assetId }) => {
			// Invalidate all event queries for this asset (respects individual filter preferences)
			void queryClient.invalidateQueries({
				queryKey: [
					...livestockQueryKeys.all,
					"eventsByAssetInfinite",
					farmId,
					assetId,
				],
			});
			void queryClient.invalidateQueries({
				queryKey: [...livestockQueryKeys.all, "eventsByAsset", farmId, assetId],
			});
			void queryClient.invalidateQueries({
				queryKey: [...livestockQueryKeys.all, "profitabilityReport", farmId],
			});
			void queryClient.invalidateQueries({
				queryKey: [...livestockQueryKeys.all, "productionReport", farmId],
			});
			void queryClient.invalidateQueries({
				queryKey: [
					...livestockQueryKeys.all,
					"aggregatedHeadcount",
					farmId,
					assetId,
				],
			});
		},
	});
};

export const useUpdateEventByAssetId = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			farmId,
			assetId,
			eventId,
			data,
		}: {
			farmId: string;
			assetId: string;
			eventId: number;
			data: LivestockEventUpdatePayload;
		}) => updateEventByAssetId({ farmId, assetId, eventId, data }),
		onSuccess: (_, { farmId, assetId }) => {
			// Invalidate all event queries for this asset (respects individual filter preferences)
			void queryClient.invalidateQueries({
				queryKey: [
					...livestockQueryKeys.all,
					"eventsByAssetInfinite",
					farmId,
					assetId,
				],
			});
			void queryClient.invalidateQueries({
				queryKey: [...livestockQueryKeys.all, "eventsByAsset", farmId, assetId],
			});
			void queryClient.invalidateQueries({
				queryKey: [...livestockQueryKeys.all, "profitabilityReport", farmId],
			});
			void queryClient.invalidateQueries({
				queryKey: [...livestockQueryKeys.all, "productionReport", farmId],
			});
			void queryClient.invalidateQueries({
				queryKey: [
					...livestockQueryKeys.all,
					"aggregatedHeadcount",
					farmId,
					assetId,
				],
			});
		},
	});
};

export const useDeleteEventByAssetId = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			farmId,
			assetId,
			eventId,
		}: {
			farmId: string;
			assetId: string;
			eventId: number;
		}) => deleteEventByAssetId({ farmId, assetId, eventId }),
		onSuccess: (_, { farmId, assetId }) => {
			// Invalidate all event queries for this asset (respects individual filter preferences)
			void queryClient.invalidateQueries({
				queryKey: [
					...livestockQueryKeys.all,
					"eventsByAssetInfinite",
					farmId,
					assetId,
				],
			});
			void queryClient.invalidateQueries({
				queryKey: [...livestockQueryKeys.all, "eventsByAsset", farmId, assetId],
			});
			void queryClient.invalidateQueries({
				queryKey: [...livestockQueryKeys.all, "profitabilityReport", farmId],
			});
			void queryClient.invalidateQueries({
				queryKey: [...livestockQueryKeys.all, "productionReport", farmId],
			});
			void queryClient.invalidateQueries({
				queryKey: [
					...livestockQueryKeys.all,
					"aggregatedHeadcount",
					farmId,
					assetId,
				],
			});
		},
	});
};

export const useCreateIndividual = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			farmId,
			assetId,
			data,
		}: {
			farmId: string;
			assetId: string;
			data: Parameters<typeof createIndividual>[0]["data"];
		}) => createIndividual({ farmId, assetId, data }),
		onSuccess: (created, { farmId, assetId }) => {
			queryClient.setQueriesData<ILivestockIndividualListResponse>(
				{
					queryKey: [
						...livestockQueryKeys.all,
						"individualsByAsset",
						farmId,
						assetId,
					],
				},
				(current) => appendIndividualToListCache(current, created),
			);
			queryClient.setQueryData(
				livestockQueryKeys.individualById(farmId, assetId, String(created.id)),
				created,
			);
			void queryClient.invalidateQueries({
				queryKey: [
					...livestockQueryKeys.all,
					"individualsByAsset",
					farmId,
					assetId,
				],
			});
		},
	});
};

export const useUpdateIndividual = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			farmId,
			assetId,
			individualId,
			data,
		}: {
			farmId: string;
			assetId: string;
			individualId: string;
			data: Parameters<typeof updateIndividual>[0]["data"];
		}) => updateIndividual({ farmId, assetId, individualId, data }),
		onSuccess: (updated, { farmId, assetId, individualId }) => {
			queryClient.setQueriesData<ILivestockIndividualListResponse>(
				{
					queryKey: [
						...livestockQueryKeys.all,
						"individualsByAsset",
						farmId,
						assetId,
					],
				},
				(current) => replaceIndividualInListCache(current, updated),
			);
			queryClient.setQueryData(
				livestockQueryKeys.individualById(farmId, assetId, individualId),
				updated,
			);
			void queryClient.invalidateQueries({
				queryKey: [
					...livestockQueryKeys.all,
					"individualsByAsset",
					farmId,
					assetId,
				],
			});
			void queryClient.invalidateQueries({
				queryKey: livestockQueryKeys.individualById(
					farmId,
					assetId,
					individualId,
				),
			});
		},
	});
};

export const useDeleteIndividual = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			farmId,
			assetId,
			individualId,
		}: {
			farmId: string;
			assetId: string;
			individualId: string;
		}) => deleteIndividual({ farmId, assetId, individualId }),
		onSuccess: (_, { farmId, assetId, individualId }) => {
			const matchesIndividualsByAssetQuery = ({
				queryKey,
			}: {
				queryKey: readonly unknown[];
			}) => {
				return (
					queryKey[0] === "livestock" &&
					queryKey[1] === "individualsByAsset" &&
					String(queryKey[2] ?? "") === farmId &&
					String(queryKey[3] ?? "") === assetId
				);
			};

			queryClient.setQueriesData<ILivestockIndividualListResponse>(
				{
					predicate: matchesIndividualsByAssetQuery,
				},
				(current) => removeIndividualFromListCache(current, individualId),
			);
			queryClient.removeQueries({
				queryKey: livestockQueryKeys.individualById(
					farmId,
					assetId,
					individualId,
				),
			});
			void queryClient.invalidateQueries({
				predicate: matchesIndividualsByAssetQuery,
				refetchType: "active",
			});
		},
	});
};

export const useCreateEventCategoryByFarmId = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			farmId,
			data,
		}: {
			farmId: string;
			data: Parameters<typeof createEventCategoryByFarmId>[0]["data"];
		}) => createEventCategoryByFarmId({ farmId, data }),
		onSuccess: (_, { farmId }) => {
			void queryClient.invalidateQueries({
				queryKey: livestockQueryKeys.eventCategoriesByFarm(farmId, undefined),
			});
		},
	});
};

export const useUpdateEventCategoryById = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			farmId,
			categoryId,
			data,
		}: {
			farmId: string;
			categoryId: number;
			data: Parameters<typeof updateEventCategoryById>[0]["data"];
		}) => updateEventCategoryById({ farmId, categoryId, data }),
		onSuccess: (_, { farmId }) => {
			void queryClient.invalidateQueries({
				queryKey: livestockQueryKeys.eventCategoriesByFarm(farmId, undefined),
			});
		},
	});
};

export const useDeleteEventCategoryById = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			farmId,
			categoryId,
		}: {
			farmId: string;
			categoryId: number;
		}) => deleteEventCategoryById({ farmId, categoryId }),
		onSuccess: (_, { farmId }) => {
			void queryClient.invalidateQueries({
				queryKey: livestockQueryKeys.eventCategoriesByFarm(farmId, undefined),
			});
		},
	});
};

// --- Asset Mutation Hooks ---

export const useCreateLivestockAsset = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			farmId,
			data,
		}: {
			farmId: string;
			data: Parameters<typeof createLivestockAsset>[0]["data"];
		}) => createLivestockAsset({ farmId, data }),
		onSuccess: (_, { farmId }) => {
			void queryClient.invalidateQueries({
				queryKey: [...livestockQueryKeys.all, "assetsByFarm", farmId],
			});
		},
	});
};

export const useUpdateLivestockAssetById = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			farmId,
			assetId,
			data,
		}: {
			farmId: string;
			assetId: number;
			data: Parameters<typeof updateLivestockAssetById>[0]["data"];
		}) => updateLivestockAssetById({ farmId, assetId, data }),
		onSuccess: (_, { farmId, assetId }) => {
			void queryClient.invalidateQueries({
				queryKey: [...livestockQueryKeys.all, "assetsByFarm", farmId],
			});
			void queryClient.invalidateQueries({
				queryKey: livestockQueryKeys.assetById(farmId, assetId),
			});
		},
	});
};

export const useDeleteLivestockAssetById = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ farmId, assetId }: { farmId: string; assetId: number }) =>
			deleteLivestockAssetById({ farmId, assetId }),
		onSuccess: (_, { farmId }) => {
			void queryClient.invalidateQueries({
				queryKey: [...livestockQueryKeys.all, "assetsByFarm", farmId],
			});
		},
	});
};
