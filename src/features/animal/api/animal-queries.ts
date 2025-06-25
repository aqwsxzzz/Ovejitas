import { useQuery } from "@tanstack/react-query";
import { getAnimalsByFarmId } from "@/features/animal/api/animal-api";
import type { IAnimalPayload } from "@/features/animal/types/animal-types";

export const animalQueryKeys = {
    all: ["animal"] as const,
    animalList: (farmId: string) => [...animalQueryKeys.all, "list", farmId] as const,
};

export const useGetAnimalsByFarmId = (payload: IAnimalPayload) =>
    useQuery({
        queryKey: animalQueryKeys.animalList(payload.farmId),
        queryFn: () => getAnimalsByFarmId({ payload }),
        select: (data) => data.data,
    });
