import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	createAnimal,
	deleteAnimalById,
	editAnimalById,
	getAnimalById,
	getAnimalsByFarmId,
} from "@/features/animal/api/animal-api";
import type {
	IAnimal,
	ICreateAnimalPayload,
	IEditAnimalPayload,
} from "@/features/animal/types/animal-types";
import { toast } from "sonner";
import type { IResponse } from "@/lib/axios";

export const animalQueryKeys = {
	all: ["animal"] as const,
	animalList: (farmId: string) =>
		[...animalQueryKeys.all, "list", farmId] as const,
	animalById: (animalId: string) =>
		[...animalQueryKeys.all, "byId", animalId] as const,
};

export const useGetAnimalsByFarmId = (farmId: string) =>
	useQuery({
		queryKey: animalQueryKeys.animalList(farmId),
		queryFn: () => getAnimalsByFarmId({ farmId }),
		select: (data) => data.data,
	});

export const useCreateAnimal = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			payload,
			farmId,
		}: {
			payload: ICreateAnimalPayload;
			farmId: string;
		}) => createAnimal({ payload, farmId }),
		onError: (error) => {
			toast.error(error.message);
		},
		onSuccess: (response, { farmId }) => {
			toast.success("Animal created successfully");
			queryClient.setQueryData<IResponse<IAnimal[]>>(
				animalQueryKeys.animalList(farmId),

				(oldData) => {
					console.log(oldData, response);
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

export const useGetAnimalById = (farmId: string, animalId: string) =>
	useQuery({
		queryKey: animalQueryKeys.animalById(animalId),
		queryFn: () => getAnimalById({ farmId, animalId }),
		select: (data) => data.data,
	});

export const useEditAnimalById = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			payload,
			farmId,
			animalId,
		}: {
			payload: IEditAnimalPayload;
			farmId: string;
			animalId: string;
		}) => editAnimalById({ payload, farmId, animalId }),
		onError: (error) => {
			toast.error(error.message);
		},
		onSuccess: (response, { farmId }) => {
			toast.success("Animal edited successfully");
			queryClient.setQueryData<IResponse<IAnimal[]>>(
				animalQueryKeys.animalList(farmId),
				(oldData) => {
					if (!oldData) {
						return;
					}
					return {
						...oldData,
						data: oldData.data.map((animal) =>
							animal.id === response.data.id ? response.data : animal,
						),
					};
				},
			);
		},
	});
};

export const useDeleteAnimalById = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ farmId, animalId }: { farmId: string; animalId: string }) =>
			deleteAnimalById({ farmId, animalId }),
		onError: (error) => {
			toast.error(error.message);
		},
		onSuccess: (_, { farmId, animalId }) => {
			toast.success("Animal deleted successfully");
			queryClient.setQueryData<IResponse<IAnimal[]>>(
				animalQueryKeys.animalList(farmId),
				(oldData) => {
					if (!oldData) {
						return;
					}
					return {
						...oldData,
						data: oldData.data.filter((animal) => animal.id !== animalId),
					};
				},
			);
		},
	});
};
