import { axiosHelper } from "@/lib/axios/axios-helper";
import type {
	IPregnancyCreatePayload,
	IPregnancyListResponse,
	IPregnancyRead,
	IPregnancyUpdatePayload,
} from "@/features/pregnancy/types/pregnancy-types";

export const createPregnancy = ({
	farmId,
	data,
}: {
	farmId: string;
	data: IPregnancyCreatePayload;
}) =>
	axiosHelper<IPregnancyRead>({
		method: "post",
		url: `/api/v1/farms/${farmId}/pregnancies`,
		data,
	});

export const listPregnancies = ({
	farmId,
	page,
	pageSize,
}: {
	farmId: string;
	page?: number;
	pageSize?: number;
}) =>
	axiosHelper<IPregnancyListResponse>({
		method: "get",
		url: `/api/v1/farms/${farmId}/pregnancies`,
		urlParams: { page, page_size: pageSize },
	});

export const updatePregnancy = ({
	farmId,
	pregnancyId,
	data,
}: {
	farmId: string;
	pregnancyId: number;
	data: IPregnancyUpdatePayload;
}) =>
	axiosHelper<IPregnancyRead>({
		method: "patch",
		url: `/api/v1/farms/${farmId}/pregnancies/${pregnancyId}`,
		data,
	});

export const deletePregnancy = ({
	farmId,
	pregnancyId,
}: {
	farmId: string;
	pregnancyId: number;
}) =>
	axiosHelper<void>({
		method: "delete",
		url: `/api/v1/farms/${farmId}/pregnancies/${pregnancyId}`,
	});
