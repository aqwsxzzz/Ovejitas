import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { useGetMeasurementsByAnimalId } from "@/features/measurement/api/measurement-queries";
import { DeleteMeasurementModal } from "@/features/measurement/components/delete-measurement-modal/delete-measurement-modal";
import { formatDateByMonth } from "@/lib/dayjs/date-formats";

interface MeasurementRecordModalProps {
	farmId: string;
	animalId: string;
	measurementType: "weight" | "height" | "temperature";
}

export const MeasurementRecordModal = ({
	farmId,
	animalId,
	measurementType,
}: MeasurementRecordModalProps) => {
	const { data: measurementData, isLoading } = useGetMeasurementsByAnimalId(
		farmId,
		animalId,
		measurementType,
	);

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button className="">Record</Button>
			</DialogTrigger>
			<DialogContent aria-describedby={undefined}>
				<DialogHeader>
					<DialogTitle className="text-2xl font-bold">
						Measurement Records
					</DialogTitle>
				</DialogHeader>
				{isLoading ? (
					<div className="h-4 bg-gray-300 rounded animate-pulse w-5/6"></div>
				) : (!isLoading && measurementData?.length == 0) || null ? (
					"No data"
				) : (
					measurementData!.map((data) => {
						return (
							<Card key={data.id}>
								<CardContent className="flex gap-4">
									<h1>
										{data.value} {data.unit}
									</h1>
									<h2>{formatDateByMonth(data.measuredAt)}</h2>
									<DeleteMeasurementModal
										measurementId={data.id}
										animalId={animalId}
									/>
								</CardContent>
							</Card>
						);
					})
				)}
			</DialogContent>
		</Dialog>
	);
};
