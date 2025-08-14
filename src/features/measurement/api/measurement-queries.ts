import {
	createMeasurement,
	deleteMeasurementById,
	getMeasurementsByAnimalId,
} from "@/features/measurement/api/measurement-api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
	ICreateMeasurementPayload,
	IMeasurement,
} from "@/features/measurement/types/measurement-types";
import { toast } from "sonner";
import type { IResponse } from "@/lib/axios";

export const measurementQueryKeys = {
	all: ["measurement"] as const,
	measurementListByAnimalId: (animalId: string) =>
		[...measurementQueryKeys.all, "list", animalId] as const,
};

export const useGetMeasurementsByAnimalId = (
	farmId: string,
	animalId: string,
	measurementType: "weight" | "height" | "temperature",
) =>
	useQuery({
		queryKey: measurementQueryKeys.measurementListByAnimalId(animalId),
		queryFn: () =>
			getMeasurementsByAnimalId({ farmId, animalId, measurementType }),
		select: (data) => data.data,
	});

export const useCreateMeasurement = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			payload,
			animalId,
		}: {
			payload: ICreateMeasurementPayload;
			animalId: string;
		}) => createMeasurement({ payload, animalId }),
		onError: (error) => {
			toast.error(error.message);
		},
		onSuccess: (response, { animalId }) => {
			toast.success("Measurement created successfully");
			queryClient.setQueryData<IResponse<IMeasurement[]>>(
				measurementQueryKeys.measurementListByAnimalId(animalId),
				(oldData) => {
					if (!oldData) {
						return;
					}
					return {
						...oldData,
						data: [...oldData.data, response.data],
					};
				},
			);
		},
	});
};

export const useDeleteMeasurementById = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			animalId,
			measurementId,
		}: {
			animalId: string;
			measurementId: string;
		}) => deleteMeasurementById({ animalId, measurementId }),
		onError: (error) => {
			toast.error(error.message);
		},
		onSuccess: (_, { animalId, measurementId }) => {
			toast.success("Measurement deleted successfully");
			queryClient.setQueryData<IResponse<IMeasurement[]>>(
				measurementQueryKeys.measurementListByAnimalId(animalId),
				(oldData) => {
					if (!oldData) {
						return;
					}
					return {
						...oldData,
						data: oldData.data.filter(
							(measurement) => measurement.id !== measurementId,
						),
					};
				},
			);
		},
	});
};
