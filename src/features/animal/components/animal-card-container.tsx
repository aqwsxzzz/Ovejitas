import { AnimalCard } from "@/features/animal/components/animal-card";
import type { IAnimal } from "@/features/animal/types/animal-types";

interface AnimalCardContainerProps {
	animalsList: IAnimal[];
	sex: IAnimal["sex"] | "";
}

export const AnimalCardContainer = ({
	animalsList,
	sex,
}: AnimalCardContainerProps) => {
	return (
		<div className="text-sidebar flex flex-col gap-2">
			{animalsList?.map((animal) => (
				<AnimalCard
					animal={animal}
					key={animal.id}
					sex={sex}
				/>
			))}
		</div>
	);
};
