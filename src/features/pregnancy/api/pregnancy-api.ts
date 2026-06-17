import { axiosHelper } from "@/lib/axios/axios-helper";
import type {
	IPregnancyCreatePayload,
	IPregnancyRead,
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
