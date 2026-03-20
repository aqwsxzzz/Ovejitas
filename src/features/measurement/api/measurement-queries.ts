import {
	createMeasurement,
	deleteMeasurementById,
	getLatestMeasurementsByAnimalId,
	getMeasurementsByAnimalId,
} from "@/features/measurement/api/measurement-api";
import {
	useInfiniteQuery,
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import type {
	ICreateMeasurementPayload,
	IMeasurement,
	MeasurementType,
} from "@/features/measurement/types/measurement-types";
import i18next from "i18next";
import { toast } from "sonner";
import type { IResponse } from "@/lib/axios";

const DEFAULT_LIST_PAGE_SIZE = 20;
const LEGACY_LIST_PAGE_SIZE = 100;

export const measurementQueryKeys = {
	all: ["measurement"] as const,
	animal: (animalId: string) =>
		[...measurementQueryKeys.all, "animal", animalId] as const,
	measurementListByAnimalId: (
		animalId: string,
		measurementType?: MeasurementType,
	) =>
		[
			...measurementQueryKeys.animal(animalId),
			"list",
			measurementType ?? "all",
		] as const,
	measurementListByAnimalIdPage: (
		animalId: string,
		limit: number,
		measurementType?: MeasurementType,
	) =>
		[
			...measurementQueryKeys.measurementListByAnimalId(
				animalId,
				measurementType,
			),
			"page",
			limit,
		] as const,
	latestByAnimalId: (animalId: string) =>
		[...measurementQueryKeys.animal(animalId), "latest"] as const,
};

export const useGetMeasurementsByAnimalId = (
	farmId: string,
	animalId: string,
	measurementType?: MeasurementType,
) =>
	useQuery({
		queryKey: measurementQueryKeys.measurementListByAnimalId(
			animalId,
			measurementType,
		),
		queryFn: () =>
			getMeasurementsByAnimalId({
				farmId,
				animalId,
				page: 1,
				limit: LEGACY_LIST_PAGE_SIZE,
				measurementType,
			}),
		select: (data) => data.data,
		enabled: Boolean(farmId) && Boolean(animalId),
	});

export const useGetLatestMeasurementsByAnimalId = (animalId: string) =>
	useQuery({
		queryKey: measurementQueryKeys.latestByAnimalId(animalId),
		queryFn: () => getLatestMeasurementsByAnimalId({ animalId }),
		select: (data) => data.data,
		enabled: Boolean(animalId),
	});

export const useGetInfiniteMeasurementsByAnimalId = ({
	farmId,
	animalId,
	limit = DEFAULT_LIST_PAGE_SIZE,
	measurementType,
}: {
	farmId: string;
	animalId: string;
	limit?: number;
	measurementType?: MeasurementType;
}) =>
	useInfiniteQuery({
		queryKey: measurementQueryKeys.measurementListByAnimalIdPage(
			animalId,
			limit,
			measurementType,
		),
		queryFn: ({ pageParam }) =>
			getMeasurementsByAnimalId({
				farmId,
				animalId,
				page: pageParam,
				limit,
				measurementType,
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
		enabled: Boolean(farmId) && Boolean(animalId),
	});

export const useGetMeasurementsByAnimalIdPage = ({
	farmId,
	animalId,
	page,
	limit,
	measurementType,
}: {
	farmId: string;
	animalId: string;
	page: number;
	limit: number;
	measurementType?: MeasurementType;
}) =>
	useQuery({
		queryKey: [
			...measurementQueryKeys.measurementListByAnimalId(
				animalId,
				measurementType,
			),
			"paged",
			page,
			limit,
		],
		queryFn: () =>
			getMeasurementsByAnimalId({
				farmId,
				animalId,
				page,
				limit,
				measurementType,
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
		enabled: Boolean(farmId) && Boolean(animalId),
	});

export const useCreateMeasurement = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			payload,
			animalId,
		}: {
			payload: ICreateMeasurementPayload;
			animalId: string;
		}) => createMeasurement({ payload, animalId }),
		onError: (error) => {
			toast.error(error.message);
		},
		onSuccess: (response, { animalId }) => {
			toast.success(i18next.t("addNewMeasurementModal:toast.createSuccess"));
			queryClient.setQueryData<IResponse<IMeasurement[]>>(
				measurementQueryKeys.measurementListByAnimalId(animalId),
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
				queryKey: measurementQueryKeys.animal(animalId),
			});
		},
	});
};

export const useDeleteMeasurementById = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			animalId,
			measurementId,
		}: {
			animalId: string;
			measurementId: string;
		}) => deleteMeasurementById({ animalId, measurementId }),
		onError: (error) => {
			toast.error(error.message);
		},
		onSuccess: (_, { animalId, measurementId }) => {
			toast.success("Measurement deleted successfully");
			queryClient.setQueryData<IResponse<IMeasurement[]>>(
				measurementQueryKeys.measurementListByAnimalId(animalId),
				(oldData) => {
					if (!oldData) {
						return;
					}
					return {
						...oldData,
						data: oldData.data.filter(
							(measurement) => measurement.id !== measurementId,
						),
					};
				},
			);

			void queryClient.invalidateQueries({
				queryKey: measurementQueryKeys.animal(animalId),
			});
		},
	});
};
