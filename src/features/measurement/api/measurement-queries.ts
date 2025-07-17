import { getMeasurementsByAnimalId } from "@/features/measurement/api/measurement-api";
import { useQuery } from "@tanstack/react-query";

export const measurementQueryKeys = {
	all: ["measurement"] as const,
	measurementListByAnimalId: (animalId: string) =>
		[...measurementQueryKeys.all, "list", animalId] as const,
};

export const useGetMeasurementsByAnimalId = (
	farmId: string,
	animalId: string,
	measurementType: "weight" | "height" | "body_condition",
	limit?: string,
) =>
	useQuery({
		queryKey: measurementQueryKeys.measurementListByAnimalId(animalId),
		queryFn: () =>
			getMeasurementsByAnimalId({ farmId, animalId, measurementType, limit }),
		select: (data) => data.data,
	});
