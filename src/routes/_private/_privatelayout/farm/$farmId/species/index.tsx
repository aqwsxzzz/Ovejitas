import { FarmAnimalSpinner } from "@/components/common/farm-animal-spinner";
import { useGetAnimalsCountBySpecies } from "@/features/animal/api/animal-queries";
import { AnimalsDashboard } from "@/features/animal/components/animals-dashboard/animals-dashboard";
import { NewAnimalModal } from "@/features/animal/components/new-animal-modal/new-animal-modal";
import { createFileRoute, useParams } from "@tanstack/react-router";
import i18next from "i18next";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute(
	"/_private/_privatelayout/farm/$farmId/species/",
)({
	component: RouteComponent,
});

function RouteComponent() {
	const language = i18next.language.slice(0, 2);
	const { farmId } = useParams({ strict: false });
	const { data: animalData, isPending } = useGetAnimalsCountBySpecies(
		language,
		farmId!,
	);
	const { t } = useTranslation("speciesIndex");

	if (isPending) {
		void animalData;
		return <FarmAnimalSpinner />;
	}

	return (
		<div className="flex flex-col gap-2">
			<div className="flex items-center justify-between mb-8 sticky top-0 bg-card z-10 py-4 px-6 shadow">
				<h1 className="text-2xl font-bold text-primary">{t("title")}</h1>
				<NewAnimalModal />
			</div>
			<AnimalsDashboard animal={animalData!} />
		</div>
	);
}
