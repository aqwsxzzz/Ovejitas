import { SpeciesCardSkeletonList } from "@/components/common/skeleton-loaders";
import {
	useGetAnimalsByFarmId,
	useGetAnimalsCountBySpecies,
} from "@/features/animal/api/animal-queries";
import { AnimalsDashboard } from "@/features/animal/components/animals-dashboard/animals-dashboard";
import { NewAnimalModal } from "@/features/animal/components/new-animal-modal/new-animal-modal";
import { createFileRoute, useParams } from "@tanstack/react-router";
import i18next from "i18next";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import FarmAnimalsEmpyState from "@/routes/_public/assets/FarmAnimalsEmpyState.svg";
import { PageHeader } from "@/components/common/page-header";

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
	const { data: allAnimalsData } = useGetAnimalsByFarmId({
		farmId: farmId!,
		withLanguage: true,
	});
	const { t } = useTranslation("speciesIndex");

	const attentionCountBySpecies = useMemo(() => {
		if (!allAnimalsData) {
			return {};
		}

		return allAnimalsData.reduce<Record<string, number>>((acc, animal) => {
			if (animal.status !== "alive") {
				acc[animal.speciesId] = (acc[animal.speciesId] ?? 0) + 1;
			}

			return acc;
		}, {});
	}, [allAnimalsData]);

	if (isPending) {
		return (
			<div className="flex flex-col gap-6 p-4">
				<PageHeader
					title={t("title")}
					description={t("subtitle")}
					action={<NewAnimalModal />}
				/>
				<SpeciesCardSkeletonList count={3} />
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-6 p-4">
			<PageHeader
				title={t("title")}
				description={t("subtitle")}
				action={<NewAnimalModal />}
			/>
			{animalData && animalData.length > 0 && (
				<AnimalsDashboard
					animal={animalData}
					attentionCountBySpecies={attentionCountBySpecies}
				/>
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
