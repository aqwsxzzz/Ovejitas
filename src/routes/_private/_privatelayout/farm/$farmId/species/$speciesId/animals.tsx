import { CardStyleHeader } from "@/components/common/card-style-header";
import { FarmAnimalSpinner } from "@/components/common/farm-animal-spinner";
import { useGetAnimalsByFarmId } from "@/features/animal/api/animal-queries";
import { AnimalCardContainer } from "@/features/animal/components/animal-card-container";
import { NewAnimalModal } from "@/features/animal/components/new-animal-modal/new-animal-modal";
import { useGetSpeciesBySpecieId } from "@/features/specie/api/specie.queries";
import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import i18next from "i18next";
import { CircleChevronLeft } from "lucide-react";

export const Route = createFileRoute(
	"/_private/_privatelayout/farm/$farmId/species/$speciesId/animals",
)({
	component: RouteComponent,
});

function RouteComponent() {
	const { farmId, speciesId } = useParams({ strict: false });
	const { data: animalsData, isPending: isPendingAnimals } =
		useGetAnimalsByFarmId({
			farmId: farmId!,
			animalFilters: {
				speciesId: speciesId!,
				language: i18next.language.slice(0, 2) as "es" | "en",
			},
		});
	const { data: speciesData, isPending: isPendingSpecies } =
		useGetSpeciesBySpecieId({
			include: "translations",
			withLanguage: true,
			speciesId: speciesId!,
		});

	if (isPendingAnimals || isPendingSpecies) {
		return <FarmAnimalSpinner />;
	}

	return (
		<div className="flex flex-col gap-2">
			<CardStyleHeader
				title={speciesData!.translations[0].name}
				Modal={NewAnimalModal}
			/>
			<div className="flex items-center gap-4">
				<Link
					to="/farm/$farmId/species"
					params={{ farmId: farmId! }}
				>
					<CircleChevronLeft />
				</Link>
			</div>
			<AnimalCardContainer
				animalsList={animalsData!}
				sex=""
			/>
		</div>
	);
}
