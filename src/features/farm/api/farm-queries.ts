import {
	getFarmById,
	getFarmCurrencies,
	getV1FarmById,
	updateFarmById,
	updateV1FarmById,
} from "@/features/farm/api/farm-api";
import type {
	IUpdateFarmPayload,
	IV1FarmUpdatePayload,
} from "@/features/farm/types/farm-types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const farmQueryKeys = {
	all: ["farm"] as const,
	farmById: (farmId: string) => [...farmQueryKeys.all, "byId", farmId] as const,
	v1FarmById: (farmId: string) =>
		[...farmQueryKeys.all, "v1ById", farmId] as const,
	currencies: () => [...farmQueryKeys.all, "currencies"] as const,
};

export const useGetFarmById = (farmId: string) =>
	useQuery({
		queryKey: farmQueryKeys.farmById(farmId),
		queryFn: () => getFarmById({ farmId }),
		select: (data) => ({
			...data.data,
			currencyCode: data.data.currency,
		}),
		enabled: !!farmId,
	});

export const useGetV1FarmById = (farmId: string) =>
	useQuery({
		queryKey: farmQueryKeys.v1FarmById(farmId),
		queryFn: () => getV1FarmById({ farmId }),
		enabled: !!farmId,
	});

export const useUpdateV1FarmById = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			farmId,
			payload,
		}: {
			farmId: string;
			payload: IV1FarmUpdatePayload;
		}) => updateV1FarmById({ farmId, payload }),
		onSuccess: async (_response, { farmId }) => {
			await queryClient.invalidateQueries({
				queryKey: farmQueryKeys.v1FarmById(farmId),
			});
		},
	});
};

export const useGetFarmCurrencies = () =>
	useQuery({
		queryKey: farmQueryKeys.currencies(),
		queryFn: getFarmCurrencies,
		select: (data) => data.data,
	});

export const useUpdateFarmById = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			farmId,
			payload,
		}: {
			farmId: string;
			payload: IUpdateFarmPayload;
		}) => updateFarmById({ farmId, payload }),
		onSuccess: async (_response, { farmId }) => {
			await queryClient.invalidateQueries({
				queryKey: farmQueryKeys.farmById(farmId),
			});
		},
	});
};
