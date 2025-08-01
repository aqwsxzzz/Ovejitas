import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AddNewMeasurementModal } from "@/features/measurement/components/add-new-measurement-modal/add-new-measurement-modal";
import { HealthCardIndividualInfo } from "@/features/animal/components/animal-profile-view/animal-profile-health-card/health-card-individual-info";

export const AnimalProfileHealthCard = () => {
	return (
		<Card className="pt-0 border-primary">
			<CardHeader className="pt-0">
				<CardTitle className="pt-0 -mt-2">
					<Badge className=" bg-secondary text-primary border-primary">
						Measurements
					</Badge>
				</CardTitle>
			</CardHeader>
			<CardContent className="flex flex-col gap-4">
				<div className="flex justify-end">
					<AddNewMeasurementModal />
				</div>
				<div className="flex flex-col justify-between items-center gap-4">
					<div className="flex justify-between gap-2">
						<HealthCardIndividualInfo measurementType="weight" />
						<HealthCardIndividualInfo measurementType="height" />
					</div>
					<HealthCardIndividualInfo measurementType="temperature" />
				</div>
			</CardContent>
		</Card>
	);
};
