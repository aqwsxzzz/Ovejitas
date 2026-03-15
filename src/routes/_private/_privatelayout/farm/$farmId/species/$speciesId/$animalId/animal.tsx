import { AnimalProfileCard } from "@/features/animal/components/animal-profile-view/animal-profile-basic-card";
import { AnimalProfileHealthCard } from "@/features/animal/components/animal-profile-view/animal-profile-health-card/animal-profile-health-card";
import { EditAnimalModal } from "@/features/animal/components/edit-animal-modal/edit-animal-modal";
import { createFileRoute, useParams } from "@tanstack/react-router";
import { HeartPulse, Baby, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGetAnimalById } from "@/features/animal/api/animal-queries";
import { AddNewMeasurementModal } from "@/features/measurement/components/add-new-measurement-modal/add-new-measurement-modal";
import { PageHeader } from "@/components/common/page-header";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute(
	"/_private/_privatelayout/farm/$farmId/species/$speciesId/$animalId/animal",
)({
	component: RouteComponent,
});

function RouteComponent() {
	const { t } = useTranslation("animalProfilePage");
	const { farmId, speciesId, animalId } = useParams({ strict: false });
	const { data: animalData } = useGetAnimalById({
		animalId: animalId!,
		include: "breed,species",
		withLanguage: true,
	});

	const scrollToSection = (sectionId: string) => {
		document.getElementById(sectionId)?.scrollIntoView({
			behavior: "smooth",
			block: "start",
		});
	};

	return (
		<div className="flex flex-col gap-6 p-4">
			<PageHeader
				title={animalData?.name || t("defaultTitle")}
				description={t("description")}
				backLink={{
					to: "/farm/$farmId/species/$speciesId/animals",
					params: { farmId: farmId!, speciesId: speciesId! },
				}}
			/>

			<AnimalProfileCard />

			{/* Quick Action Buttons */}
			<div className="grid grid-cols-3 gap-3">
				<AddNewMeasurementModal
					trigger={
						<Button
							variant="outline"
							className="flex flex-col items-center gap-2 h-auto py-4 w-full"
						>
							<HeartPulse className="h-6 w-6 text-info" />
							<span className="text-caption font-medium">
								{t("quickActions.healthCheck")}
							</span>
						</Button>
					}
				/>
				{animalData ? (
					<EditAnimalModal
						animal={animalData}
						trigger={
							<Button
								variant="outline"
								className="flex flex-col items-center gap-2 h-auto py-4 w-full"
							>
								<Baby className="h-6 w-6 text-breeding" />
								<span className="text-caption font-medium">
									{t("quickActions.breeding")}
								</span>
							</Button>
						}
					/>
				) : (
					<Button
						variant="outline"
						className="flex flex-col items-center gap-2 h-auto py-4"
						disabled
					>
						<Baby className="h-6 w-6 text-breeding" />
						<span className="text-caption font-medium">
							{t("quickActions.breeding")}
						</span>
					</Button>
				)}
				<Button
					variant="outline"
					className="flex flex-col items-center gap-2 h-auto py-4"
					onClick={() => scrollToSection("health-records")}
				>
					<FileText className="h-6 w-6 text-warning" />
					<span className="text-caption font-medium">
						{t("quickActions.notes")}
					</span>
				</Button>
			</div>

			<AnimalProfileHealthCard />
		</div>
	);
}
