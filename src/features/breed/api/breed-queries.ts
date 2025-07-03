import { getBreedsBySpecieId } from "@/features/breed/api/breed-api";
import { useQuery } from "@tanstack/react-query";

export const breedQueryKeys = {
    all: ["breeds"] as const,
    breedsListBySpecieId: (speciesId: string) => [...breedQueryKeys.all, "list", speciesId] as const,
};

export const useGetBreedsBySpecieId = (speciesId: string) => {
    return useQuery({
        queryKey: breedQueryKeys.breedsListBySpecieId(speciesId),
        queryFn: () => getBreedsBySpecieId({ speciesId }),
        select: (data) => data.data,
        staleTime: 1000 * 60 * 5,
    });
};
