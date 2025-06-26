import { useMutation, useQuery } from "@tanstack/react-query";
import { createAnimal, getAnimalsByFarmId } from "@/features/animal/api/animal-api";
import type { ICreateAnimalPayload } from "@/features/animal/types/animal-types";
import { toast } from "sonner";

export const animalQueryKeys = {
    all: ["animal"] as const,
    animalList: (farmId: string) => [...animalQueryKeys.all, "list", farmId] as const,
};

export const useGetAnimalsByFarmId = (farmId: string) =>
    useQuery({
        queryKey: animalQueryKeys.animalList(farmId),
        queryFn: () => getAnimalsByFarmId({ farmId }),
        select: (data) => data.data,
    });

export const useCreateAnimal = () =>
    useMutation({
        mutationFn: ({ payload, farmId }: { payload: ICreateAnimalPayload; farmId: string }) => createAnimal({ payload, farmId }),
        onError: (error) => {
            toast.error(error.message);
        },
        onSuccess: () => {
            toast.success("Animal created successfully");
        },
    });
