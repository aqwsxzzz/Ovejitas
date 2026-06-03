import type { IMemberRead, IMemberRoleUpdate, IPagedMembers } from "@/features/members/types/members-types";
import { axiosHelper } from "@/lib/axios/axios-helper";

export const getFarmMembers = ({
	farmId,
	page = 1,
	pageSize = 50,
}: {
	farmId: string;
	page?: number;
	pageSize?: number;
}) =>
	axiosHelper<IPagedMembers>({
		method: "get",
		url: `/api/v1/farms/${farmId}/members`,
		urlParams: { page, page_size: pageSize },
	});

export const updateMemberRole = ({
	farmId,
	memberId,
	payload,
}: {
	farmId: string;
	memberId: number;
	payload: IMemberRoleUpdate;
}) =>
	axiosHelper<IMemberRead>({
		method: "patch",
		url: `/api/v1/farms/${farmId}/members/${memberId}`,
		data: payload,
	});

export const removeFarmMember = ({
	farmId,
	memberId,
}: {
	farmId: string;
	memberId: number;
}) =>
	axiosHelper<void>({
		method: "delete",
		url: `/api/v1/farms/${farmId}/members/${memberId}`,
	});
