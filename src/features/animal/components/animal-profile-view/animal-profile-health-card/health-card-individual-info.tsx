import { useGetMeasurementsByAnimalId } from "@/features/measurement/api/measurement-queries";
import { MeasurementRecordModal } from "@/features/measurement/components/measurement-record-modal";
import type { IMeasurement } from "@/features/measurement/types/measurement-types";
import { formatDateByMonth } from "@/lib/dayjs/date-formats";
import { useParams } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Scale, Ruler, Thermometer, type LucideIcon } from "lucide-react";

const measurementConfig: Record<
	IMeasurement["measurementType"],
	{ icon: LucideIcon; color: string }
> = {
	weight: { icon: Scale, color: "text-primary" },
	height: { icon: Ruler, color: "text-info" },
	temperature: { icon: Thermometer, color: "text-error" },
};

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

	const Icon = measurementConfig[measurementType].icon;
	const iconColor = measurementConfig[measurementType].color;

	return (
		<div className="flex flex-col gap-3 p-4 border border-border rounded-lg bg-card hover:shadow-md transition-shadow">
			{/* Header with icon and title */}
			<div className="flex items-center gap-2">
				<Icon className={`h-5 w-5 ${iconColor}`} />
				<h3 className="text-h2 font-semibold text-foreground">
					{t(`${measurementType}Title`)}
				</h3>
			</div>

			{/* Measurement value and date */}
			<div className="flex flex-col gap-2">
				<div>
					<p className="text-caption text-muted-foreground uppercase tracking-wide mb-1">
						Value
					</p>
					{isLoading ? (
						<div className="h-6 bg-muted rounded animate-pulse w-24"></div>
					) : !isLoading && (!filteredData || filteredData.length === 0) ? (
						<p className="text-body text-muted-foreground">{t("missingData")}</p>
					) : (
						<p className="text-h1 font-bold text-foreground">
							{filteredData?.[0]?.value} <span className="text-body text-muted-foreground">{filteredData?.[0]?.unit}</span>
						</p>
					)}
				</div>

				<div>
					<p className="text-caption text-muted-foreground uppercase tracking-wide mb-1">
						{t("dateTitle")}
					</p>
					{isLoading ? (
						<div className="h-5 bg-muted rounded animate-pulse w-20"></div>
					) : !isLoading && (!filteredData || filteredData.length === 0) ? (
						<p className="text-small text-muted-foreground">{t("missingData")}</p>
					) : (
						<p className="text-small text-foreground">
							{formatDateByMonth(filteredData![0].measuredAt)}
						</p>
					)}
				</div>
			</div>

			{/* View records button */}
			<div className="mt-2">
				<MeasurementRecordModal
					farmId={farmId!}
					animalId={animalId!}
					measurementType={measurementType}
				/>
			</div>
		</div>
	);
};
