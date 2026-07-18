import {
	archiveCurrency,
	createCurrency,
	getFarmCurrencies,
	updateCurrency,
} from "@/features/currency/api/currency-api";
import { readLastCurrencyCode } from "@/features/currency/currency-preference";
import type {
	ICurrencyCreate,
	ICurrencyUpdate,
} from "@/features/currency/types/currency-types";
import { useGetV1FarmById } from "@/features/farm/api/farm-queries";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const currencyQueryKeys = {
	all: ["currencies"] as const,
	list: (farmId: string) => [...currencyQueryKeys.all, "list", farmId] as const,
};

const CURRENCY_STALE_TIME = 5 * 60_000;

/** Currencies enabled for a farm (source of truth for id → display code). */
export const useGetFarmCurrencies = ({ farmId }: { farmId: string }) =>
	useQuery({
		queryKey: currencyQueryKeys.list(farmId),
		queryFn: () => getFarmCurrencies({ farmId }),
		select: (data) => data.data,
		enabled: !!farmId,
		staleTime: CURRENCY_STALE_TIME,
	});

/**
 * `currency_id → code` lookup for rendering monetary amounts. Shares the list
 * query cache; consumers resolve codes with `getCurrencyCode`.
 */
export const useFarmCurrencyMap = ({ farmId }: { farmId: string }) =>
	useQuery({
		queryKey: currencyQueryKeys.list(farmId),
		queryFn: () => getFarmCurrencies({ farmId }),
		select: (data) =>
			new Map(data.data.map((currency) => [currency.id, currency.code])),
		enabled: !!farmId,
		staleTime: CURRENCY_STALE_TIME,
	});

/**
 * Preselection for monetary forms: the last-used currency, else the farm's
 * `default_currency`, else the first enabled currency. Derived during render
 * (no effects); `undefined` until the currency list loads.
 */
export const useDefaultCurrencyId = (farmId: string): number | undefined => {
	const { data: currencies } = useGetFarmCurrencies({ farmId });
	const { data: farm } = useGetV1FarmById(farmId);

	const active = currencies?.filter((currency) => currency.archived_at == null);
	if (!active || active.length === 0) return undefined;

	const idByCode = (code: string | null | undefined): number | undefined =>
		code ? active.find((currency) => currency.code === code)?.id : undefined;

	return (
		idByCode(readLastCurrencyCode(farmId)) ??
		idByCode(farm?.default_currency) ??
		active[0].id
	);
};

export const useCreateCurrency = ({ farmId }: { farmId: string }) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (payload: ICurrencyCreate) =>
			createCurrency({ farmId, payload }),
		onError: (error) => toast.error(error.message),
		onSuccess: () => {
			toast.success("Moneda agregada");
			void queryClient.invalidateQueries({
				queryKey: currencyQueryKeys.list(farmId),
			});
		},
	});
};

export const useUpdateCurrency = ({ farmId }: { farmId: string }) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			currencyId,
			payload,
		}: {
			currencyId: number;
			payload: ICurrencyUpdate;
		}) => updateCurrency({ farmId, currencyId, payload }),
		onError: (error) => toast.error(error.message),
		onSuccess: () => {
			toast.success("Moneda actualizada");
			void queryClient.invalidateQueries({
				queryKey: currencyQueryKeys.list(farmId),
			});
		},
	});
};

export const useArchiveCurrency = ({ farmId }: { farmId: string }) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (currencyId: number) => archiveCurrency({ farmId, currencyId }),
		onError: (error) => toast.error(error.message),
		onSuccess: () => {
			toast.success("Moneda archivada");
			void queryClient.invalidateQueries({
				queryKey: currencyQueryKeys.list(farmId),
			});
		},
	});
};
