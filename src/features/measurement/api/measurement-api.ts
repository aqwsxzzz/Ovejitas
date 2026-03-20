import { axiosHelper } from "@/lib/axios/axios-helper";
import type { IResponse } from "@/lib/axios";
import type {
	ICreateMeasurementPayload,
	IDeleteMeasurementResponse,
	IMeasurement,
	MeasurementType,
} from "@/features/measurement/types/measurement-types";

export const getMeasurementsByAnimalId = ({
	animalId,
	page,
	limit,
	measurementType,
}: {
	farmId: string;
	animalId: string;
	page?: number;
	limit?: number;
	measurementType?: MeasurementType;
}) =>
	axiosHelper<IResponse<IMeasurement[]>>({
		method: "get",
		url: `/animals/${animalId}/measurements`,
		urlParams: {
			page,
			limit,
			measurementType,
		},
	});

export const getLatestMeasurementsByAnimalId = ({
	animalId,
}: {
	animalId: string;
}) =>
	axiosHelper<IResponse<IMeasurement[]>>({
		method: "get",
		url: `/animals/${animalId}/measurements/latest`,
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
