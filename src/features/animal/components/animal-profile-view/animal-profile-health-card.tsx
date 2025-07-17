import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetMeasurementsByAnimalId } from "@/features/measurement/api/measurement-queries";
import type { IMeasurement } from "@/features/measurement/types/measurement";
import { formatDateByMonth } from "@/lib/dayjs/date-formats";
import { useParams } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { MeasurementRecordModal } from "@/features/measurement/components/measurement-record-modal";
import { AddNewMeasurementModal } from "@/features/measurement/components/add-new-measurement-modal";

export const AnimalProfileHealthCard = () => {
	const { farmId, animalId } = useParams({ strict: false });
	const values: {
		measurementType: IMeasurement["measurementType"];
		limit: string;
	} = {
		measurementType: "weight",
		limit: "1",
	};
	const { data: measurementData, isLoading } = useGetMeasurementsByAnimalId(
		farmId!,
		animalId!,
		values.measurementType,
		values.limit,
	);

	return (
		<Card className="pt-0 border-primary">
			<CardHeader className="pt-0">
				<CardTitle className="pt-0 -mt-2">
					<Badge className=" bg-secondary text-primary border-primary">
						Health
					</Badge>
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="flex">
					<div>
						<h1>Last weight</h1>
						<h2>
							{isLoading ? (
								<div className="h-4 bg-gray-300 rounded animate-pulse w-5/6"></div>
							) : (!isLoading && measurementData?.length == 0) || null ? (
								"No data"
							) : (
								`${measurementData?.[0]?.value} ${measurementData?.[0]?.unit}`
							)}
						</h2>
					</div>
					<div>
						<h1>Date</h1>
						<h2>
							{isLoading ? (
								<div className="h-4 bg-gray-300 rounded animate-pulse w-5/6"></div>
							) : (!isLoading && measurementData?.length == 0) || null ? (
								"No data"
							) : (
								formatDateByMonth(measurementData![0].measuredAt)
							)}
						</h2>
					</div>
				</div>
				<div className="flex gap-2">
					<AddNewMeasurementModal />
					<MeasurementRecordModal
						farmId={farmId!}
						animalId={animalId!}
						measurementType={values.measurementType}
					/>
				</div>
			</CardContent>
		</Card>
	);
};
