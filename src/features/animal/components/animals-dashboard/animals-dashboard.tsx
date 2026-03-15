import { AnimalCountBySpeciesCard } from "@/features/animal/components/animals-dashboard/animal-by-sepcies-card/animals-count-by-species-card";
import type { IAnimalsCountBySpeciesResponse } from "@/features/animal/types/animal-types";

interface AnimalDashboardProps {
	animal: IAnimalsCountBySpeciesResponse[];
	attentionCountBySpecies?: Record<string, number>;
}

export const AnimalsDashboard = ({
	animal,
	attentionCountBySpecies,
}: AnimalDashboardProps) => {
	return (
		<div className="flex flex-col gap-1 sm:gap-2 w-full">
			{animal?.map((animal: IAnimalsCountBySpeciesResponse) => (
				<AnimalCountBySpeciesCard
					key={animal.species.id}
					animal={animal}
					attentionCount={attentionCountBySpecies?.[animal.species.id] ?? 0}
				/>
			))}
		</div>
	);
};
