import type {
	ICurrency,
	ICurrencyCreate,
	ICurrencyUpdate,
	IPagedCurrencies,
} from "@/features/currency/types/currency-types";
import { axiosHelper } from "@/lib/axios/axios-helper";

/**
 * List the currencies enabled for a farm. A farm holds only a handful of
 * currencies (bounded by the ISO allowlist), so a single large page covers the
 * lookup use case without client-side pagination.
 */
export const getFarmCurrencies = ({
	farmId,
	page = 1,
	pageSize = 100,
}: {
	farmId: string;
	page?: number;
	pageSize?: number;
}) =>
	axiosHelper<IPagedCurrencies>({
		method: "get",
		url: `/api/v1/farms/${farmId}/currencies`,
		urlParams: { page, page_size: pageSize },
	});

export const createCurrency = ({
	farmId,
	payload,
}: {
	farmId: string;
	payload: ICurrencyCreate;
}) =>
	axiosHelper<ICurrency>({
		method: "post",
		url: `/api/v1/farms/${farmId}/currencies`,
		data: payload,
	});

export const updateCurrency = ({
	farmId,
	currencyId,
	payload,
}: {
	farmId: string;
	currencyId: number;
	payload: ICurrencyUpdate;
}) =>
	axiosHelper<ICurrency>({
		method: "patch",
		url: `/api/v1/farms/${farmId}/currencies/${currencyId}`,
		data: payload,
	});

/** Archives a currency (BE never hard-deletes while events reference it). */
export const archiveCurrency = ({
	farmId,
	currencyId,
}: {
	farmId: string;
	currencyId: number;
}) =>
	axiosHelper<void>({
		method: "delete",
		url: `/api/v1/farms/${farmId}/currencies/${currencyId}`,
	});
