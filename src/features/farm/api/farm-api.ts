import { axiosHelper } from "@/lib/axios/axios-helper";
import type { IResponse } from "@/lib/axios";
import type { IFarm } from "@/features/farm/types/farm-types";

export const getFarmById = ({ farmId }: { farmId: string }) =>
	axiosHelper<IResponse<IFarm>>({
		method: "get",
		url: `/farms/${farmId}`,
	});
