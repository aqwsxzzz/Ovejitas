import { AnimalCard } from "@/features/animal/components/animal-card";
import type { IAnimal } from "@/features/animal/types/animal-types";

interface AnimalCardContainerProps {
    animalsList: IAnimal[];
}

export const AnimalCardContainer = ({ animalsList }: AnimalCardContainerProps) => {
    if (animalsList.length === 0) {
        return <div>No existen animales que mostrar</div>;
    }

    return <div className="bg-sidebar-accent-foreground text-sidebar">{animalsList?.map((animal) => <AnimalCard animal={animal} />)}</div>;
};
