import { useGetMeasurementsByAnimalId } from "@/features/measurement/api/measurement-queries";
import { MeasurementRecordModal } from "@/features/measurement/components/measurement-record-modal";
import type { IMeasurement } from "@/features/measurement/types/measurement";
import { formatDateByMonth } from "@/lib/dayjs/date-formats";
import { useParams } from "@tanstack/react-router";

export const HealthCardIndividualInfo = ({
	measurementType,
}: {
	measurementType: IMeasurement["measurementType"];
}) => {
	const { farmId, animalId } = useParams({ strict: false });

	const { data: measurementData, isLoading } = useGetMeasurementsByAnimalId(
		farmId!,
		animalId!,
		measurementType,
	);

	return (
		<div className="flex flex-col">
			<div className="flex gap-4">
				<div className="flex flex-col gap-2">
					<h1>{measurementType}</h1>
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
				<MeasurementRecordModal
					farmId={farmId!}
					animalId={animalId!}
					measurementType={measurementType}
				/>
			</div>
		</div>
	);
};
