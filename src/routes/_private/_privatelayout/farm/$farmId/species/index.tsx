import { CardStyleHeader } from "@/components/common/card-style-header";
import { FarmAnimalSpinner } from "@/components/common/farm-animal-spinner";
import { useGetAnimalsCountBySpecies } from "@/features/animal/api/animal-queries";
import { AnimalsDashboard } from "@/features/animal/components/animals-dashboard/animals-dashboard";
import { NewAnimalModal } from "@/features/animal/components/new-animal-modal/new-animal-modal";
import { createFileRoute, useParams } from "@tanstack/react-router";
import i18next from "i18next";
import { useTranslation } from "react-i18next";
import FarmAnimalsEmpyState from "@/routes/_public/assets/FarmAnimalsEmpyState.svg";

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
		return <FarmAnimalSpinner />;
	}

	return (
		<div className="flex flex-col gap-2">
			<CardStyleHeader
				title={t("title")}
				Modal={NewAnimalModal}
			/>
			{animalData && animalData.length > 0 && (
				<AnimalsDashboard animal={animalData!} />
			)}
			{animalData && animalData.length === 0 && (
				<div className="text-muted-foreground p-4 pt-12 flex justify-center">
					<img
						src={FarmAnimalsEmpyState}
						alt="Farm empty illustration"
						style={{ width: "350px", maxWidth: "100%" }}
					/>
				</div>
			)}
		</div>
	);
}
