import {
	getSpecies,
	getSpeciesBySpecieId,
} from "@/features/specie/api/specie-api";
import { useQuery } from "@tanstack/react-query";

export const specieQueryKeys = {
	all: ["species"] as const,
	specie: (specieId: string) => [...specieQueryKeys.all, specieId] as const,
};

export const useGetSpecies = ({
	include,
	withLanguage,
}: {
	include: string;
	withLanguage: boolean;
}) => {
	return useQuery({
		queryKey: [...specieQueryKeys.all],
		queryFn: () => getSpecies({ include, withLanguage }),
		select: (data) => data.data,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
	});
};

export const useGetSpeciesBySpecieId = ({
	include,
	withLanguage,
	speciesId,
}: {
	include: string;
	withLanguage: boolean;
	speciesId: string;
}) => {
	return useQuery({
		queryKey: [...specieQueryKeys.specie(speciesId)],
		queryFn: () => getSpeciesBySpecieId({ include, withLanguage, speciesId }),
		select: (data) => data.data,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
	});
};
