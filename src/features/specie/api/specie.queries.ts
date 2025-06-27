import { getSpecies } from "@/features/specie/api/specie-api";
import { useQuery } from "@tanstack/react-query";

export const specieQueryKeys = {
    all: ["species"] as const,
};

export const useGetSpecies = (language: string) => {
    return useQuery({
        queryKey: [...specieQueryKeys.all],
        queryFn: () => getSpecies({ language }),
        select: (data) => data.data,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
    });
};
