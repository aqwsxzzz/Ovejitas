import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	createEggPricing,
	getActiveEggPricing,
	getEggPricingHistory,
} from "@/features/egg-pricing/api/egg-pricing-api";
import type { ICreateEggPricingPayload } from "@/features/egg-pricing/types/egg-pricing-types";

export const eggPricingQueryKeys = {
	all: ["egg-pricing"] as const,
	active: () => [...eggPricingQueryKeys.all, "active"] as const,
	history: () => [...eggPricingQueryKeys.all, "history"] as const,
};

export const useGetActiveEggPricing = (enabled = true) =>
	useQuery({
		queryKey: eggPricingQueryKeys.active(),
		queryFn: getActiveEggPricing,
		select: (data) => data.data,
		enabled,
	});

export const useGetEggPricingHistory = (enabled = true) =>
	useQuery({
		queryKey: eggPricingQueryKeys.history(),
		queryFn: getEggPricingHistory,
		select: (data) => data.data,
		enabled,
	});

export const useCreateEggPricing = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: ICreateEggPricingPayload) =>
			createEggPricing({ payload }),
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: eggPricingQueryKeys.active(),
			});
			await queryClient.invalidateQueries({
				queryKey: eggPricingQueryKeys.history(),
			});
		},
	});
};
