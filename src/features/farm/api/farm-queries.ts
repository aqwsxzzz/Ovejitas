import {
	getFarmById,
	getFarmCurrencies,
	updateFarmById,
} from "@/features/farm/api/farm-api";
import type { IUpdateFarmPayload } from "@/features/farm/types/farm-types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const farmQueryKeys = {
	all: ["farm"] as const,
	farmById: (farmId: string) => [...farmQueryKeys.all, "byId", farmId] as const,
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
