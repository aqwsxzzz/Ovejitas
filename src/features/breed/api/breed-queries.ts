import {
	createBreed,
	createBreedTranslation,
	getBreedsBySpecies,
} from "@/features/breed/api/breed-api";
import type {
	BreedOrder,
	CreateBreedPayload,
	CreateBreedTranslationPayload,
} from "@/features/breed/types/breed";
import { useMutation, useQuery } from "@tanstack/react-query";

type BreedQueryOptions = {
	order?: string | BreedOrder;
	includeTranslations?: boolean;
	withLanguage?: boolean;
	language?: string;
};

export const breedQueryKeys = {
	all: ["breeds"] as const,
	bySpecies: (speciesId: string, options?: BreedQueryOptions) =>
		[
			...breedQueryKeys.all,
			"by-species",
			speciesId,
			options?.order ?? "",
			options?.includeTranslations ?? true,
			options?.withLanguage ?? true,
			options?.language ?? "",
		] as const,
};

export const useGetBreedsBySpeciesId = (
	speciesId: string,
	orderOrOptions?: string | BreedQueryOptions,
) => {
	const options =
		typeof orderOrOptions === "string"
			? { order: orderOrOptions }
			: orderOrOptions;

	return useQuery({
		queryKey: breedQueryKeys.bySpecies(speciesId, options),
		queryFn: () => getBreedsBySpecies(speciesId, options),
		enabled: Boolean(speciesId),
		staleTime: 1000 * 60 * 5,
	});
};

export const useCreateBreed = () =>
	useMutation({
		mutationFn: (payload: CreateBreedPayload) => createBreed(payload),
	});

export const useCreateBreedTranslation = () =>
	useMutation({
		mutationFn: (payload: CreateBreedTranslationPayload) =>
			createBreedTranslation(payload),
	});

// Backward-compatible aliases for previous naming.
export const useGetBreedsBySpecieId = useGetBreedsBySpeciesId;
export const useBreeds = useGetBreedsBySpeciesId;
