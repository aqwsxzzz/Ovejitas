import { axiosHelper } from "@/lib/axios/axios-helper";
import type { IResponse } from "@/lib/axios";
import type {
	ICreateMeasurementPayload,
	IMeasurement,
} from "@/features/measurement/types/measurement";

export const getMeasurementsByAnimalId = ({
	farmId,
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
		url: `/farms/${farmId}/animals/${animalId}/measurements?measurementType=${measurementType}&limit=${limit}`,
	});

export const createMeasurement = ({
	payload,
	farmId,
	animalId,
}: {
	payload: ICreateMeasurementPayload;
	farmId: string;
	animalId: string;
}) =>
	axiosHelper<IResponse<IMeasurement>>({
		method: "post",
		url: `/farms/${farmId}/animals/${animalId}/measurements`,
		data: payload,
	});
