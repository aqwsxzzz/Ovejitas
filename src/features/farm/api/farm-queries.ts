import { getFarmById } from "@/features/farm/api/farm-api";
import { useQuery } from "@tanstack/react-query";

export const farmQueryKeys = {
	all: ["farm"] as const,
	farmById: (farmId: string) => [...farmQueryKeys.all, "byId", farmId] as const,
};

export const useGetFarmById = (farmId: string) =>
	useQuery({
		queryKey: farmQueryKeys.farmById(farmId),
		queryFn: () => getFarmById({ farmId }),
		select: (data) => data.data,
	});
