import { getBreedsBySpecies } from "@/features/breed/api/breed-api";
import type { BreedOrder } from "@/features/breed/types/breed";
import { useQuery } from "@tanstack/react-query";

export const breedQueryKeys = {
	all: ["breeds"] as const,
	bySpecies: (speciesId: string, order?: string) =>
		[...breedQueryKeys.all, "by-species", speciesId, order ?? ""] as const,
};

export const useGetBreedsBySpeciesId = (
	speciesId: string,
	order?: string | BreedOrder,
) =>
	useQuery({
		queryKey: breedQueryKeys.bySpecies(speciesId, order),
		queryFn: () => getBreedsBySpecies(speciesId, order),
		enabled: Boolean(speciesId),
		staleTime: 1000 * 60 * 5,
	});

// Backward-compatible aliases for previous naming.
export const useGetBreedsBySpecieId = useGetBreedsBySpeciesId;
export const useBreeds = useGetBreedsBySpeciesId;
