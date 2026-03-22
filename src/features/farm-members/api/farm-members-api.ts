import type { IFarmMember } from "@/features/farm-members/types/farm-members-types";
import type { IResponse } from "@/lib/axios";
import { axiosHelper } from "@/lib/axios/axios-helper";

export const getFarmMembers = ({
	farmId,
	page,
	limit,
}: {
	farmId: string;
	page?: number;
	limit?: number;
}) =>
	axiosHelper<IResponse<IFarmMember[]>>({
		method: "get",
		url: `/farm-members/${farmId}/members`,
		urlParams: {
			page,
			limit,
		},
	});
