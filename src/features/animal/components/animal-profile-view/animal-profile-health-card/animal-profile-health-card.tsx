import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AddNewMeasurementModal } from "@/features/measurement/components/add-new-measurement-modal/add-new-measurement-modal";
import { HealthCardIndividualInfo } from "@/features/animal/components/animal-profile-view/animal-profile-health-card/health-card-individual-info";
import { useTranslation } from "react-i18next";

export const AnimalProfileHealthCard = () => {
	const { t } = useTranslation("animalProfileHealthCard");
	return (
		<Card className="rounded-card shadow-card">
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
				<CardTitle className="flex items-center gap-2">
					<Badge variant="secondary" className="border-primary">
						{t("headerTitle")}
					</Badge>
				</CardTitle>
				<AddNewMeasurementModal />
			</CardHeader>
			<CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<HealthCardIndividualInfo measurementType="weight" />
				<HealthCardIndividualInfo measurementType="height" />
				<HealthCardIndividualInfo measurementType="temperature" />
			</CardContent>
		</Card>
	);
};
