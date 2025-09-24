import type { IFarmMember } from "@/features/farm-invitations/types/farm-invitations-types";
import type { IResponse } from "@/lib/axios";
import { axiosHelper } from "@/lib/axios/axios-helper";

export const getFarmMembers = ({ farmId }: { farmId: string }) =>
	axiosHelper<IResponse<IFarmMember[]>>({
		method: "get",
		url: `/farm-members/${farmId}/members`,
	});
