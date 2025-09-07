import i18next from "i18next";
import { useParams } from "@tanstack/react-router";
import { useGetAnimalsCountBySpecies } from "@/features/animal/api/animal-queries";
import { AnimalCountBySpeciesCard } from "@/features/animal/components/animals-dashboard/animal-by-sepcies-card/animals-count-by-species-card";
import type { IAnimalsCountBySpeciesResponse } from "@/features/animal/types/animal-types";

export const AnimalsDashboard = () => {
	const language = i18next.language.slice(0, 2);
	const { farmId } = useParams({ strict: false });
	const { data: animalData } = useGetAnimalsCountBySpecies(language, farmId!);

	return (
		<div className="flex flex-col gap-1 sm:gap-2 w-full">
			{animalData?.map((animal: IAnimalsCountBySpeciesResponse) => (
				<AnimalCountBySpeciesCard
					key={animal.species.id}
					animal={animal}
				/>
			))}
		</div>
	);
};
