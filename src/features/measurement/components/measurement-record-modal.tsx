import { Button } from "@/components/ui/button";
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
import { formatDateByMonth } from "@/lib/dayjs/date-formats";
import { useState } from "react";
import { useTranslation } from "react-i18next";

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
	});
	const { t } = useTranslation("measurementRecordModal");
	const measurementData = measurementPage?.items ?? [];
	const totalMeasurements = measurementPage?.total ?? measurementData.length;
	const totalPages = measurementPage?.totalPages ?? 1;

	const filteredData = measurementData?.filter(
		(m) => m.measurementType === measurementType,
	);

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button className="">{t("modalButtonTrigger")}</Button>
			</DialogTrigger>
			<DialogContent aria-describedby={undefined}>
				<DialogHeader>
					<DialogTitle className="text-2xl font-bold">
						{t("modalTitle")}
					</DialogTitle>
				</DialogHeader>
				{isLoading ? (
					<div className="h-4 bg-gray-300 rounded animate-pulse w-5/6"></div>
				) : filteredData.length === 0 ? (
					t("missingData")
				) : (
					<div className="space-y-3">
						{filteredData.map((data) => (
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
						))}
						<div className="flex flex-wrap items-center gap-2">
							<label className="text-caption text-muted-foreground">
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
							<Button
								variant="outline"
								onClick={() => setPage((previous) => Math.max(previous - 1, 1))}
								disabled={page <= 1 || isFetching}
							>
								{t("previous")}
							</Button>
							<Button
								variant="outline"
								onClick={() =>
									setPage((previous) => Math.min(previous + 1, totalPages))
								}
								disabled={page >= totalPages || isFetching}
							>
								{t("next")}
							</Button>
							<span className="text-caption text-muted-foreground">
								{t("pageLabel", { page, totalPages })}
							</span>
						</div>
						<p className="text-caption text-muted-foreground">
							{t("showingCount", {
								visible: filteredData.length,
								total: totalMeasurements,
							})}
						</p>
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
};
