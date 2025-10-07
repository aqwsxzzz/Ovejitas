import {
	EntityCacheManager,
	type EntityCacheManagerConfig,
} from "@/components/common/query-cache/query-cache-handlers";
import { animalQueryKeys } from "@/features/animal/api/animal-queries";
import type { IAnimal } from "@/features/animal/types/animal-types";
import i18next from "i18next";
import { QueryClient } from "@tanstack/react-query";

// Define how to match filters for animals
export const animalFilterMatcher = (item: IAnimal, filters?: string[]) => {
	if (!filters) return true;
	const [sex, speciesId] = filters;
	if (sex && item.sex !== sex) return false;
	if (speciesId && item.speciesId !== speciesId) return false;
	return true;
};

// Build the config for animals
export const animalCacheConfig: EntityCacheManagerConfig<IAnimal> = {
	entityKey: "animal",
	listKeyIndex: 2, // farmId is at index 2 in your queryKey
	filterIndex: 3, // filters are at index 3
	countQueryKeyFn: (farmId: string) =>
		animalQueryKeys.animalsCountBySpecies(farmId, i18next.language.slice(0, 2)),
	filterMatcher: animalFilterMatcher,
};

// Factory function to create a manager instance
export function getAnimalCacheManager(queryClient: QueryClient) {
	return new EntityCacheManager<IAnimal>(queryClient, animalCacheConfig);
}
