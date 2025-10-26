import { AnimalProfileCard } from "@/features/animal/components/animal-profile-view/animal-profile-basic-card";
import { AnimalProfileHealthCard } from "@/features/animal/components/animal-profile-view/animal-profile-health-card/animal-profile-health-card";
import { createFileRoute, useParams } from "@tanstack/react-router";
import { HeartPulse, Baby, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGetAnimalById } from "@/features/animal/api/animal-queries";
import { PageHeader } from "@/components/common/page-header";

export const Route = createFileRoute(
	"/_private/_privatelayout/farm/$farmId/species/$speciesId/$animalId/animal",
)({
	component: RouteComponent,
});

function RouteComponent() {
	const { farmId, speciesId, animalId } = useParams({ strict: false });
	const { data: animalData } = useGetAnimalById({
		animalId: animalId!,
		include: "breed,species",
		withLanguage: true,
	});

	return (
		<div className="flex flex-col gap-6 p-4">
			<PageHeader
				title={animalData?.name || "Animal Details"}
				description="View and manage animal information"
				backLink={{
					to: "/farm/$farmId/species/$speciesId/animals",
					params: { farmId: farmId!, speciesId: speciesId! }
				}}
			/>

			<AnimalProfileCard />

			{/* Quick Action Buttons */}
			<div className="grid grid-cols-3 gap-3">
				<Button
					variant="outline"
					className="flex flex-col items-center gap-2 h-auto py-4"
					onClick={() => console.log("Health Check")}
				>
					<HeartPulse className="h-6 w-6 text-info" />
					<span className="text-caption font-medium">Health Check</span>
				</Button>
				<Button
					variant="outline"
					className="flex flex-col items-center gap-2 h-auto py-4"
					onClick={() => console.log("Breeding Log")}
				>
					<Baby className="h-6 w-6 text-breeding" />
					<span className="text-caption font-medium">Breeding</span>
				</Button>
				<Button
					variant="outline"
					className="flex flex-col items-center gap-2 h-auto py-4"
					onClick={() => console.log("Notes")}
				>
					<FileText className="h-6 w-6 text-warning" />
					<span className="text-caption font-medium">Notes</span>
				</Button>
			</div>

			<AnimalProfileHealthCard />
		</div>
	);
}
