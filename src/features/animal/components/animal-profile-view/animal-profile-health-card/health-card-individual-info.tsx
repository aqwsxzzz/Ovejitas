import { useGetMeasurementsByAnimalId } from "@/features/measurement/api/measurement-queries";
import { MeasurementRecordModal } from "@/features/measurement/components/measurement-record-modal";
import type { IMeasurement } from "@/features/measurement/types/measurement-types";
import { formatDateByMonth } from "@/lib/dayjs/date-formats";
import { useParams } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

export const HealthCardIndividualInfo = ({
	measurementType,
}: {
	measurementType: IMeasurement["measurementType"];
}) => {
	const { t } = useTranslation("healthCardIndividualInfo");
	const { farmId, animalId } = useParams({ strict: false });

	const { data: measurementData, isLoading } = useGetMeasurementsByAnimalId(
		farmId!,
		animalId!,
	);

	const filteredData = measurementData?.filter(
		(m) => m.measurementType === measurementType,
	);

	return (
		<div className="flex flex-col">
			<div className="flex gap-4">
				<div className="flex flex-col gap-2">
					<h1>{t(`${measurementType}Title`)}</h1>
					<h2>
						{isLoading ? (
							<div className="h-4 bg-gray-300 rounded animate-pulse w-5/6"></div>
						) : !isLoading && (!filteredData || filteredData.length === 0) ? (
							t("missingData")
						) : (
							`${filteredData?.[0]?.value} ${filteredData?.[0]?.unit}`
						)}
					</h2>
				</div>
				<div>
					<h1>{t("dateTitle")}</h1>
					<h2>
						{isLoading ? (
							<div className="h-4 bg-gray-300 rounded animate-pulse w-5/6"></div>
						) : !isLoading && (!filteredData || filteredData.length === 0) ? (
							t("missingData")
						) : (
							formatDateByMonth(filteredData![0].measuredAt)
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
