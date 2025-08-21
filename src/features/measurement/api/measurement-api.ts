import { axiosHelper } from "@/lib/axios/axios-helper";
import type { IResponse } from "@/lib/axios";
import type {
	ICreateMeasurementPayload,
	IDeleteMeasurementResponse,
	IMeasurement,
} from "@/features/measurement/types/measurement-types";

export const getMeasurementsByAnimalId = ({
	animalId,
}: {
	farmId: string;
	animalId: string;
}) =>
	axiosHelper<IResponse<IMeasurement[]>>({
		method: "get",
		url: `/animals/${animalId}/measurements`,
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

export const deleteMeasurementById = ({
	animalId,
	measurementId,
}: {
	animalId: string;
	measurementId: string;
}) =>
	axiosHelper<IResponse<IDeleteMeasurementResponse>>({
		method: "delete",
		url: `animals/${animalId}/measurements/${measurementId}`,
	});
