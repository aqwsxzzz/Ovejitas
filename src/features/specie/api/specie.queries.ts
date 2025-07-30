import { getSpecies } from "@/features/specie/api/specie-api";
import { useQuery } from "@tanstack/react-query";

export const specieQueryKeys = {
	all: ["species"] as const,
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
