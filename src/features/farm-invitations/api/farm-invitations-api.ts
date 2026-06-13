import type {
	IAcceptInvitationPayload,
	IInvitationCreatePayload,
	IInvitationCreateResponse,
	IInvitationListResponse,
	IInvitationResolve,
	InvitationStatus,
} from "@/features/farm-invitations/types/farm-invitations-types";
import type { ITokenPair } from "@/features/auth/types/auth-types";
import { axiosHelper } from "@/lib/axios/axios-helper";

export const createFarmInvitation = ({
	farmId,
	payload,
}: {
	farmId: string;
	payload: IInvitationCreatePayload;
}) =>
	axiosHelper<IInvitationCreateResponse>({
		method: "post",
		url: `/api/v1/farms/${farmId}/invitations`,
		data: payload,
	});

export const getFarmInvitations = ({
	farmId,
	status,
	page = 1,
	pageSize = 20,
}: {
	farmId: string;
	status?: InvitationStatus;
	page?: number;
	pageSize?: number;
}) =>
	axiosHelper<IInvitationListResponse>({
		method: "get",
		url: `/api/v1/farms/${farmId}/invitations`,
		urlParams: {
			...(status ? { status } : {}),
			page,
			page_size: pageSize,
			sort: "-created_at",
		},
	});

export const revokeFarmInvitation = ({
	farmId,
	invitationId,
}: {
	farmId: string;
	invitationId: number;
}) =>
	axiosHelper<void>({
		method: "post",
		url: `/api/v1/farms/${farmId}/invitations/${invitationId}/revoke`,
	});

export const resolveInvitationToken = ({ token }: { token: string }) =>
	axiosHelper<IInvitationResolve>({
		method: "get",
		url: `/api/v1/invitations/${token}`,
	});

export const acceptInvitation = ({
	token,
	payload,
}: {
	token: string;
	payload: IAcceptInvitationPayload;
}) =>
	axiosHelper<ITokenPair>({
		method: "post",
		url: `/api/v1/invitations/${token}/accept`,
		data: payload,
	});
