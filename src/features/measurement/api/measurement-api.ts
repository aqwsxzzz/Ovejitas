import { axiosHelper } from "@/lib/axios/axios-helper";
import type { IResponse } from "@/lib/axios";
import type {
	ICreateMeasurementPayload,
	IMeasurement,
} from "@/features/measurement/types/measurement";

export const getMeasurementsByAnimalId = ({
	animalId,
	measurementType,
	limit = "10",
}: {
	farmId: string;
	animalId: string;
	measurementType: "weight" | "height" | "body_condition";
	limit?: string;
}) =>
	axiosHelper<IResponse<IMeasurement[]>>({
		method: "get",
		url: `/animals/${animalId}/measurements?measurementType=${measurementType}&limit=${limit}`,
	});

export const createMeasurement = ({
	payload,
	animalId,
}: {
	payload: ICreateMeasurementPayload;
	animalId: string;
}) =>
	axiosHelper<IResponse<IMeasurement>>({
		method: "post",
		url: `/animals/${animalId}/measurements`,
		data: payload,
	});
