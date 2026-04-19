import { axiosHelper } from "@/lib/axios/axios-helper";
import type { IResponse } from "@/lib/axios";
import type {
	IFarm,
	IFarmCurrencyOption,
	IUpdateFarmPayload,
} from "@/features/farm/types/farm-types";

export const getFarmById = ({ farmId }: { farmId: string }) =>
	axiosHelper<IResponse<IFarm>>({
		method: "get",
		url: `/farms/${farmId}`,
	});

export const getFarmCurrencies = () =>
	axiosHelper<IResponse<IFarmCurrencyOption[]>>({
		method: "get",
		url: "/farms/currencies",
	});

export const updateFarmById = ({
	farmId,
	payload,
}: {
	farmId: string;
	payload: IUpdateFarmPayload;
}) =>
	axiosHelper<IResponse<IFarm>>({
		method: "post",
		url: `/farms/${farmId}`,
		data: payload,
	});
