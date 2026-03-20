import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { useGetMeasurementsByAnimalIdPage } from "@/features/measurement/api/measurement-queries";
import { DeleteMeasurementModal } from "@/features/measurement/components/delete-measurement-modal/delete-measurement-modal";
import type {
	IMeasurement,
	MeasurementType,
} from "@/features/measurement/types/measurement-types";
import { formatDateByMonth } from "@/lib/dayjs/date-formats";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

interface MeasurementRecordModalProps {
	farmId: string;
	animalId: string;
	measurementType: MeasurementType;
}

const formatSignedNumber = (value: number): string => {
	const formatter = new Intl.NumberFormat(undefined, {
		maximumFractionDigits: 2,
		minimumFractionDigits: 0,
	});

	return `${value > 0 ? "+" : ""}${formatter.format(value)}`;
};

const ANOMALY_CHANGE_THRESHOLD: Record<MeasurementType, number> = {
	weight: 5,
	height: 3,
	temperature: 1,
};

const ANOMALY_PERCENT_THRESHOLD = 10;

const getTrendDirection = (
	change: number | null | undefined,
): "up" | "down" | "neutral" => {
	if (change === null || change === undefined || change === 0) {
		return "neutral";
	}

	return change > 0 ? "up" : "down";
};

const isAnomalousChange = (
	measurement: IMeasurement,
	measurementType: MeasurementType,
): boolean => {
	if (measurement.change === null || measurement.change === undefined) {
		return false;
	}

	const isHighAbsoluteChange =
		Math.abs(measurement.change) >= ANOMALY_CHANGE_THRESHOLD[measurementType];
	const isHighPercentChange =
		measurement.changePercent !== null &&
		measurement.changePercent !== undefined &&
		Math.abs(measurement.changePercent) >= ANOMALY_PERCENT_THRESHOLD;

	return isHighAbsoluteChange || isHighPercentChange;
};

const hasTrendData = (measurement: IMeasurement): boolean =>
	measurement.change !== null && measurement.change !== undefined;

export const MeasurementRecordModal = ({
	farmId,
	animalId,
	measurementType,
}: MeasurementRecordModalProps) => {
	const pageSizeOptions = [5, 10, 20];
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);
	const {
		data: measurementPage,
		isLoading,
		isFetching,
	} = useGetMeasurementsByAnimalIdPage({
		farmId,
		animalId,
		page,
		limit: pageSize,
		measurementType,
	});
	const { t } = useTranslation("measurementRecordModal");
	const measurementData = measurementPage?.items ?? [];
	const totalMeasurements = measurementPage?.total ?? measurementData.length;
	const totalPages = measurementPage?.totalPages ?? 1;

	const getChangeText = (measurement: IMeasurement): string => {
		const { change, changePercent } = measurement;

		if (change === null || change === undefined) {
			return String(t("insufficientData"));
		}

		if (change === 0) {
			return String(t("changeNeutral"));
		}

		if (changePercent === null || changePercent === undefined) {
			return String(
				t("changeValueOnly", {
					change: formatSignedNumber(change),
					unit: measurement.unit,
				}),
			);
		}

		return String(
			t("changeWithPercent", {
				change: formatSignedNumber(change),
				unit: measurement.unit,
				percent: formatSignedNumber(changePercent),
			}),
		);
	};

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button className="">{t("modalButtonTrigger")}</Button>
			</DialogTrigger>
			<DialogContent
				aria-describedby={undefined}
				className="max-h-[85vh] w-[92vw] min-w-[20rem] max-w-[42rem] overflow-hidden sm:w-[36rem] md:w-[40rem]"
			>
				<DialogHeader>
					<DialogTitle className="text-2xl font-bold">
						{t("modalTitle")}
					</DialogTitle>
				</DialogHeader>
				{isLoading ? (
					<div className="h-4 bg-gray-300 rounded animate-pulse w-5/6"></div>
				) : measurementData.length === 0 ? (
					t("missingData")
				) : (
					<div className="flex max-h-[70vh] flex-col gap-3 overflow-hidden">
						<div className="space-y-3 overflow-y-auto pr-1">
							{measurementData.map((data) => {
								const canShowTrend = hasTrendData(data);
								const trendDirection = getTrendDirection(data.change);
								const hasAnomaly = isAnomalousChange(data, measurementType);

								return (
									<Card
										key={data.id}
										className={cn(
											hasAnomaly && "border-warning/60 bg-warning/5",
										)}
									>
										<CardContent className="flex flex-wrap items-center justify-between gap-4">
											<div className="space-y-1">
												<h1 className="text-lg font-semibold text-foreground">
													{data.value} {data.unit}
												</h1>
												<h2 className="text-sm text-muted-foreground">
													{formatDateByMonth(data.measuredAt)}
												</h2>
												<p
													className={cn(
														"text-sm",
														!canShowTrend && "text-muted-foreground",
														trendDirection === "up" && "text-success",
														trendDirection === "down" && "text-error",
														trendDirection === "neutral" &&
															"text-muted-foreground",
													)}
												>
													{canShowTrend && trendDirection === "up" && "↑ "}
													{canShowTrend && trendDirection === "down" && "↓ "}
													{canShowTrend && trendDirection === "neutral" && "→ "}
													{getChangeText(data)}
												</p>
												{canShowTrend && hasAnomaly ? (
													<Badge variant="warning">
														{t("anomalyDetected")}
													</Badge>
												) : null}
											</div>
											<DeleteMeasurementModal
												measurementId={data.id}
												animalId={animalId}
											/>
										</CardContent>
									</Card>
								);
							})}
						</div>
						<div className="flex flex-col items-center gap-2">
							<div className="flex flex-wrap items-center justify-center gap-2">
								<div className="flex items-center gap-2">
									<label className="text-caption whitespace-nowrap text-muted-foreground">
										{t("perPage")}
									</label>
									<select
										className="h-9 rounded-md border border-input bg-background px-2 text-sm"
										value={pageSize}
										onChange={(event) => {
											setPageSize(Number(event.target.value));
											setPage(1);
										}}
									>
										{pageSizeOptions.map((option) => (
											<option
												key={option}
												value={option}
											>
												{option}
											</option>
										))}
									</select>
								</div>
								<div className="flex items-center gap-2">
									<Button
										variant="outline"
										className="shrink-0 sm:hidden"
										size="icon"
										onClick={() =>
											setPage((previous) => Math.max(previous - 1, 1))
										}
										disabled={page <= 1 || isFetching}
										aria-label={t("previous")}
									>
										<ChevronLeft className="h-4 w-4" />
									</Button>
									<Button
										variant="outline"
										className="shrink-0 sm:hidden"
										size="icon"
										onClick={() =>
											setPage((previous) => Math.min(previous + 1, totalPages))
										}
										disabled={page >= totalPages || isFetching}
										aria-label={t("next")}
									>
										<ChevronRight className="h-4 w-4" />
									</Button>
									<Button
										variant="outline"
										className="hidden shrink-0 sm:inline-flex"
										onClick={() =>
											setPage((previous) => Math.max(previous - 1, 1))
										}
										disabled={page <= 1 || isFetching}
									>
										{t("previous")}
									</Button>
									<Button
										variant="outline"
										className="hidden shrink-0 sm:inline-flex"
										onClick={() =>
											setPage((previous) => Math.min(previous + 1, totalPages))
										}
										disabled={page >= totalPages || isFetching}
									>
										{t("next")}
									</Button>
								</div>
							</div>
							<span className="text-caption whitespace-nowrap text-muted-foreground">
								<span className="sm:hidden">
									{page}/{totalPages}
								</span>
								<span className="hidden sm:inline">
									{t("pageLabel", { page, totalPages })}
								</span>
							</span>
						</div>
						<p className="text-caption text-center text-muted-foreground">
							{t("showingCount", {
								visible: measurementData.length,
								total: totalMeasurements,
							})}
						</p>
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
};
