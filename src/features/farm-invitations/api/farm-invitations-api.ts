import type {
	IFarmInvitationResponse,
	IFarmInvitationPayload,
} from "@/features/farm-invitations/types/farm-invitations-types";
import type { IResponse } from "@/lib/axios";
import { axiosHelper } from "@/lib/axios/axios-helper";

export const sendFarmInvitation = ({
	payload,
}: {
	payload: IFarmInvitationPayload;
}) =>
	axiosHelper<IResponse<IFarmInvitationResponse>>({
		method: "post",
		url: "/invitations",
		data: payload,
	});
