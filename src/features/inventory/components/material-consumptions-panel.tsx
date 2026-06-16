import { useState } from "react";
import { EmptyState } from "@/components/common/empty-state";
import { LoadingState } from "@/components/common/loading-state";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	useDeleteMaterialConsumptionById,
	useListIndividualsByAssetId,
	useListLivestockAssetsByFarmId,
	useListMaterialConsumptionsByFarmId,
	useUpdateMaterialConsumptionById,
} from "@/features/livestock/api/livestock-queries";
import { getMaterialActionErrorMessage } from "@/features/inventory/components/material-action-utils";
import { MaterialPaginationControls } from "@/features/inventory/components/material-pagination-controls";
import {
	formatDate,
	MATERIAL_PAGE_SIZE,
	toDateTimeInputValue,
	toNumber,
} from "@/features/inventory/components/material-detail-utils";
import type {
	IMaterialConsumptionRead,
	LivestockEventUnit,
	MaterialConsumptionReason,
} from "@/features/livestock/types/livestock-types";
import { EVENT_UNITS } from "@/shared/types/unit-types";

interface MaterialConsumptionsPanelProps {
	farmId: string;
	materialAssetId: number;
}

type ConsumptionReasonFilter = "all" | MaterialConsumptionReason;

export function MaterialConsumptionsPanel({
	farmId,
	materialAssetId,
}: MaterialConsumptionsPanelProps) {
	const [consumptionError, setConsumptionError] = useState<string | null>(null);
	const [consumptionPage, setConsumptionPage] = useState(1);
	const [consumptionReasonFilter, setConsumptionReasonFilter] =
		useState<ConsumptionReasonFilter>("all");
	const [editingConsumptionId, setEditingConsumptionId] = useState<
		number | null
	>(null);
	const [editingConsumptionOccurredAt, setEditingConsumptionOccurredAt] =
		useState("");
	const [editingConsumptionQuantity, setEditingConsumptionQuantity] =
		useState("");
	const [editingConsumptionUnit, setEditingConsumptionUnit] =
		useState<LivestockEventUnit>("kg");
	const [editingConsumptionReason, setEditingConsumptionReason] =
		useState<MaterialConsumptionReason>("feeding");
	const [
		editingConsumptionConsumerAssetId,
		setEditingConsumptionConsumerAssetId,
	] = useState("");
	const [editingConsumptionIndividualId, setEditingConsumptionIndividualId] =
		useState("");
	const [editingConsumptionNotes, setEditingConsumptionNotes] = useState("");
	const [deletingConsumptionId, setDeletingConsumptionId] = useState<
		number | null
	>(null);

	const consumptionsQuery = useListMaterialConsumptionsByFarmId({
		farmId,
		filters: {
			materialAssetId,
			reason:
				consumptionReasonFilter === "all" ? undefined : consumptionReasonFilter,
			page: consumptionPage,
			pageSize: MATERIAL_PAGE_SIZE,
		},
		enabled: !!farmId,
	});
	const consumerAssetsQuery = useListLivestockAssetsByFarmId({
		farmId,
		filters: { kind: "animal", page: 1, pageSize: 100 },
		enabled: !!farmId,
	});
	const editingIndividualsQuery = useListIndividualsByAssetId({
		farmId,
		assetId: editingConsumptionConsumerAssetId,
		filters: { page: 1, pageSize: 100, status: "active" },
		enabled:
			!!farmId &&
			editingConsumptionId !== null &&
			editingConsumptionConsumerAssetId.length > 0,
	});
	const updateConsumptionMutation = useUpdateMaterialConsumptionById();
	const deleteConsumptionMutation = useDeleteMaterialConsumptionById();

	const handleStartEditConsumption = (
		consumption: IMaterialConsumptionRead,
	) => {
		setEditingConsumptionId(consumption.id);
		setEditingConsumptionOccurredAt(
			toDateTimeInputValue(consumption.occurred_at),
		);
		setEditingConsumptionQuantity(String(toNumber(consumption.quantity)));
		setEditingConsumptionUnit(consumption.unit);
		setEditingConsumptionReason(consumption.reason);
		setEditingConsumptionConsumerAssetId(
			consumption.consumer_asset_id
				? String(consumption.consumer_asset_id)
				: "",
		);
		setEditingConsumptionIndividualId(
			consumption.individual_id ? String(consumption.individual_id) : "",
		);
		setEditingConsumptionNotes(consumption.notes ?? "");
		setConsumptionError(null);
	};

	const handleSaveConsumptionEdit = async () => {
		if (!farmId || editingConsumptionId === null) return;

		const quantity = Number(editingConsumptionQuantity);
		if (!Number.isFinite(quantity) || quantity <= 0) {
			setConsumptionError("Quantity must be greater than 0.");
			return;
		}
		if (!editingConsumptionOccurredAt) {
			setConsumptionError("Date and time are required.");
			return;
		}
		if (
			editingConsumptionReason === "feeding" &&
			editingConsumptionConsumerAssetId.length === 0
		) {
			setConsumptionError("Feeding requires a consumer asset.");
			return;
		}
		if (
			editingConsumptionReason !== "feeding" &&
			editingConsumptionConsumerAssetId.length > 0
		) {
			setConsumptionError(
				"Waste and spoilage must not include consumer assets.",
			);
			return;
		}

		setConsumptionError(null);
		try {
			await updateConsumptionMutation.mutateAsync({
				farmId,
				consumptionId: editingConsumptionId,
				materialAssetId,
				data: {
					occurred_at: new Date(editingConsumptionOccurredAt).toISOString(),
					quantity,
					unit: editingConsumptionUnit,
					reason: editingConsumptionReason,
					consumer_asset_id:
						editingConsumptionReason === "feeding"
							? Number(editingConsumptionConsumerAssetId)
							: null,
					individual_id:
						editingConsumptionReason === "feeding" &&
						editingConsumptionIndividualId.trim().length > 0
							? Number(editingConsumptionIndividualId)
							: null,
					notes: editingConsumptionNotes.trim() || null,
				},
			});
			setEditingConsumptionId(null);
		} catch (error) {
			setConsumptionError(
				getMaterialActionErrorMessage(error, "Failed to update consumption."),
			);
		}
	};

	const handleDeleteConsumption = async (consumptionId: number) => {
		if (!farmId) return;

		setConsumptionError(null);
		setDeletingConsumptionId(consumptionId);
		try {
			await deleteConsumptionMutation.mutateAsync({
				farmId,
				consumptionId,
				materialAssetId,
			});
			if (editingConsumptionId === consumptionId) {
				setEditingConsumptionId(null);
			}
		} catch (error) {
			setConsumptionError(
				getMaterialActionErrorMessage(error, "Failed to delete consumption."),
			);
		} finally {
			setDeletingConsumptionId(null);
		}
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Consumptions</CardTitle>
			</CardHeader>
			<CardContent className="space-y-2">
				<div className="space-y-1.5">
					<Label htmlFor="consumption-filter-reason">Reason filter</Label>
					<Select
						value={consumptionReasonFilter}
						onValueChange={(value) => {
							setConsumptionReasonFilter(value as ConsumptionReasonFilter);
							setConsumptionPage(1);
						}}
					>
						<SelectTrigger
							id="consumption-filter-reason"
							className="w-full"
						>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">all</SelectItem>
							<SelectItem value="feeding">feeding</SelectItem>
							<SelectItem value="waste">waste</SelectItem>
							<SelectItem value="spoilage">spoilage</SelectItem>
						</SelectContent>
					</Select>
				</div>
				{consumptionsQuery.isLoading ? (
					<LoadingState message="Cargando consumos..." />
				) : null}
				{consumptionsQuery.error ? (
					<p className="text-sm text-destructive">
						Failed to load consumptions.
					</p>
				) : null}
				{!consumptionsQuery.isLoading &&
				!consumptionsQuery.error &&
				(consumptionsQuery.data?.data ?? []).length === 0 ? (
					<EmptyState title="Sin consumos registrados" />
				) : null}
				{consumptionError ? (
					<p className="text-sm text-destructive">{consumptionError}</p>
				) : null}
				{(consumptionsQuery.data?.data ?? []).map((consumption) => (
					<div
						key={consumption.id}
						className="rounded-lg border px-3 py-2 text-sm"
					>
						<div className="flex items-start justify-between gap-2">
							<div>
								<p className="font-medium">
									{toNumber(consumption.quantity).toFixed(2)} {consumption.unit}{" "}
									· {consumption.reason}
								</p>
								<p className="text-(--v2-ink-soft)">
									{formatDate(consumption.occurred_at)}
								</p>
							</div>
							<div className="flex gap-2">
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={() => handleStartEditConsumption(consumption)}
								>
									Edit
								</Button>
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={() => void handleDeleteConsumption(consumption.id)}
									disabled={deletingConsumptionId === consumption.id}
								>
									{deletingConsumptionId === consumption.id
										? "Deleting..."
										: "Delete"}
								</Button>
							</div>
						</div>
						{editingConsumptionId === consumption.id ? (
							<div className="mt-3 space-y-2 border-t pt-3">
								<div className="grid gap-2 md:grid-cols-2">
									<Input
										type="datetime-local"
										value={editingConsumptionOccurredAt}
										onChange={(event) =>
											setEditingConsumptionOccurredAt(event.target.value)
										}
									/>
									<Input
										type="number"
										step="0.01"
										value={editingConsumptionQuantity}
										onChange={(event) =>
											setEditingConsumptionQuantity(event.target.value)
										}
									/>
									<Select
										value={editingConsumptionUnit}
										onValueChange={(value) =>
											setEditingConsumptionUnit(value as LivestockEventUnit)
										}
									>
										<SelectTrigger className="w-full">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											{EVENT_UNITS.map((eventUnit) => (
												<SelectItem
													key={eventUnit}
													value={eventUnit}
												>
													{eventUnit}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<Select
										value={editingConsumptionReason}
										onValueChange={(value) => {
											const nextReason = value as MaterialConsumptionReason;
											setEditingConsumptionReason(nextReason);
											if (nextReason !== "feeding") {
												setEditingConsumptionConsumerAssetId("");
												setEditingConsumptionIndividualId("");
											}
										}}
									>
										<SelectTrigger className="w-full">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="feeding">feeding</SelectItem>
											<SelectItem value="waste">waste</SelectItem>
											<SelectItem value="spoilage">spoilage</SelectItem>
										</SelectContent>
									</Select>
									<Select
										value={editingConsumptionConsumerAssetId || "none"}
										onValueChange={(value) => {
											setEditingConsumptionConsumerAssetId(
												value === "none" ? "" : value,
											);
											setEditingConsumptionIndividualId("");
										}}
										disabled={editingConsumptionReason !== "feeding"}
									>
										<SelectTrigger className="w-full">
											<SelectValue placeholder="Consumer asset" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="none">None</SelectItem>
											{(consumerAssetsQuery.data?.data ?? []).map((item) => (
												<SelectItem
													key={item.id}
													value={String(item.id)}
												>
													{item.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<Select
										value={editingConsumptionIndividualId || "none"}
										onValueChange={(value) =>
											setEditingConsumptionIndividualId(
												value === "none" ? "" : value,
											)
										}
										disabled={
											editingConsumptionReason !== "feeding" ||
											editingConsumptionConsumerAssetId.length === 0
										}
									>
										<SelectTrigger className="w-full">
											<SelectValue placeholder="Individual" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="none">None</SelectItem>
											{(editingIndividualsQuery.data?.data ?? []).map(
												(individual) => (
													<SelectItem
														key={individual.id}
														value={String(individual.id)}
													>
														{individual.name ||
															individual.tag ||
															`#${individual.id}`}
													</SelectItem>
												),
											)}
										</SelectContent>
									</Select>
									<Input
										value={editingConsumptionNotes}
										onChange={(event) =>
											setEditingConsumptionNotes(event.target.value)
										}
										placeholder="Notes"
									/>
								</div>
								<div className="flex justify-end gap-2">
									<Button
										type="button"
										variant="outline"
										onClick={() => setEditingConsumptionId(null)}
									>
										Cancel
									</Button>
									<Button
										type="button"
										onClick={() => void handleSaveConsumptionEdit()}
										disabled={updateConsumptionMutation.isPending}
									>
										{updateConsumptionMutation.isPending ? "Saving..." : "Save"}
									</Button>
								</div>
							</div>
						) : null}
					</div>
				))}
				<MaterialPaginationControls
					page={consumptionPage}
					hasNext={consumptionsQuery.data?.meta.has_next ?? false}
					onPrevious={() =>
						setConsumptionPage((current) => Math.max(1, current - 1))
					}
					onNext={() => setConsumptionPage((current) => current + 1)}
				/>
			</CardContent>
		</Card>
	);
}
