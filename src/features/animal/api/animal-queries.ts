import { useMutation, useQuery } from "@tanstack/react-query";
import { createAnimal, editAnimalById, getAnimalById, getAnimalsByFarmId } from "@/features/animal/api/animal-api";
import type { ICreateAnimalPayload, IEditAnimalPayload } from "@/features/animal/types/animal-types";
import { toast } from "sonner";

export const animalQueryKeys = {
    all: ["animal"] as const,
    animalList: (farmId: string) => [...animalQueryKeys.all, "list", farmId] as const,
    animalById: (animalId: string) => [...animalQueryKeys.all, "byId", animalId] as const,
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

export const useGetAnimalById = (farmId: string, animalId: string) =>
    useQuery({
        queryKey: animalQueryKeys.animalById(animalId),
        queryFn: () => getAnimalById({ farmId, animalId }),
        select: (data) => data.data,
    });

export const useEditAnimalById = () =>
    useMutation({
        mutationFn: ({ payload, farmId, animalId }: { payload: IEditAnimalPayload; farmId: string; animalId: string }) => editAnimalById({ payload, farmId, animalId }),
        onError: (error) => {
            toast.error(error.message);
        },
        onSuccess: () => {
            toast.success("Animal edited successfully");
        },
    });
