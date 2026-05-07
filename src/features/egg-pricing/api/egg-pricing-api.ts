import { axiosHelper } from "@/lib/axios/axios-helper";
import type { IResponse } from "@/lib/axios";
import type {
	ICreateEggPricingPayload,
	IEggPricing,
} from "@/features/egg-pricing/types/egg-pricing-types";

export const getActiveEggPricing = () =>
	axiosHelper<IResponse<IEggPricing>>({
		method: "get",
		url: "/egg-pricings/active",
	});

export const getEggPricingHistory = () =>
	axiosHelper<IResponse<IEggPricing[]>>({
		method: "get",
		url: "/egg-pricings/history",
	});

export const createEggPricing = ({
	payload,
}: {
	payload: ICreateEggPricingPayload;
}) =>
	axiosHelper<IResponse<IEggPricing>>({
		method: "post",
		url: "/egg-pricings",
		data: payload,
	});
