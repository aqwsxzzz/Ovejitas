import { useState } from "react";

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
	useDeleteMaterialPurchaseById,
	useListMaterialPurchasesByFarmId,
	useUpdateMaterialPurchaseById,
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
	IMaterialPurchaseRead,
	LivestockEventUnit,
} from "@/features/livestock/types/livestock-types";
import { EVENT_UNITS } from "@/shared/types/unit-types";

interface MaterialPurchasesPanelProps {
	farmId: string;
	materialAssetId: number;
}

export function MaterialPurchasesPanel({
	farmId,
	materialAssetId,
}: MaterialPurchasesPanelProps) {
	const [purchaseError, setPurchaseError] = useState<string | null>(null);
	const [purchasePage, setPurchasePage] = useState(1);
	const [purchaseFrom, setPurchaseFrom] = useState("");
	const [purchaseTo, setPurchaseTo] = useState("");
	const [editingPurchaseId, setEditingPurchaseId] = useState<number | null>(
		null,
	);
	const [editingPurchaseOccurredAt, setEditingPurchaseOccurredAt] =
		useState("");
	const [editingPurchaseQuantity, setEditingPurchaseQuantity] = useState("");
	const [editingPurchaseUnit, setEditingPurchaseUnit] =
		useState<LivestockEventUnit>("kg");
	const [editingPurchaseAmount, setEditingPurchaseAmount] = useState("");
	const [editingPurchaseSupplier, setEditingPurchaseSupplier] = useState("");
	const [editingPurchaseNotes, setEditingPurchaseNotes] = useState("");
	const [deletingPurchaseId, setDeletingPurchaseId] = useState<number | null>(
		null,
	);

	const purchasesQuery = useListMaterialPurchasesByFarmId({
		farmId,
		filters: {
			materialAssetId,
			from: purchaseFrom || undefined,
			to: purchaseTo || undefined,
			page: purchasePage,
			pageSize: MATERIAL_PAGE_SIZE,
		},
		enabled: !!farmId,
	});
	const updatePurchaseMutation = useUpdateMaterialPurchaseById();
	const deletePurchaseMutation = useDeleteMaterialPurchaseById();

	const handleStartEditPurchase = (purchase: IMaterialPurchaseRead) => {
		setEditingPurchaseId(purchase.id);
		setEditingPurchaseOccurredAt(toDateTimeInputValue(purchase.occurred_at));
		setEditingPurchaseQuantity(String(toNumber(purchase.quantity)));
		setEditingPurchaseUnit(purchase.unit);
		setEditingPurchaseAmount(String(toNumber(purchase.amount)));
		setEditingPurchaseSupplier(purchase.supplier ?? "");
		setEditingPurchaseNotes(purchase.notes ?? "");
		setPurchaseError(null);
	};

	const handleSavePurchaseEdit = async () => {
		if (!farmId || editingPurchaseId === null) return;

		const quantity = Number(editingPurchaseQuantity);
		const amount = Number(editingPurchaseAmount);
		if (!Number.isFinite(quantity) || quantity <= 0) {
			setPurchaseError("Quantity must be greater than 0.");
			return;
		}
		if (!Number.isFinite(amount) || amount <= 0) {
			setPurchaseError("Amount must be greater than 0.");
			return;
		}
		if (!editingPurchaseOccurredAt) {
			setPurchaseError("Date and time are required.");
			return;
		}

		setPurchaseError(null);
		try {
			await updatePurchaseMutation.mutateAsync({
				farmId,
				purchaseId: editingPurchaseId,
				materialAssetId,
				data: {
					occurred_at: new Date(editingPurchaseOccurredAt).toISOString(),
					quantity,
					unit: editingPurchaseUnit,
					amount,
					supplier: editingPurchaseSupplier.trim() || null,
					notes: editingPurchaseNotes.trim() || null,
				},
			});
			setEditingPurchaseId(null);
		} catch (error) {
			setPurchaseError(
				getMaterialActionErrorMessage(error, "Failed to update purchase."),
			);
		}
	};

	const handleDeletePurchase = async (purchaseId: number) => {
		if (!farmId) return;

		setPurchaseError(null);
		setDeletingPurchaseId(purchaseId);
		try {
			await deletePurchaseMutation.mutateAsync({
				farmId,
				purchaseId,
				materialAssetId,
			});
			if (editingPurchaseId === purchaseId) {
				setEditingPurchaseId(null);
			}
		} catch (error) {
			setPurchaseError(
				getMaterialActionErrorMessage(error, "Failed to delete purchase."),
			);
		} finally {
			setDeletingPurchaseId(null);
		}
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Purchases</CardTitle>
			</CardHeader>
			<CardContent className="space-y-2">
				<div className="grid gap-3 md:grid-cols-2">
					<div className="space-y-1.5">
						<Label htmlFor="purchase-from">From</Label>
						<Input
							id="purchase-from"
							type="date"
							value={purchaseFrom}
							onChange={(event) => {
								setPurchaseFrom(event.target.value);
								setPurchasePage(1);
							}}
						/>
					</div>
					<div className="space-y-1.5">
						<Label htmlFor="purchase-to">To</Label>
						<Input
							id="purchase-to"
							type="date"
							value={purchaseTo}
							onChange={(event) => {
								setPurchaseTo(event.target.value);
								setPurchasePage(1);
							}}
						/>
					</div>
				</div>
				<div className="flex justify-end">
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={() => {
							setPurchaseFrom("");
							setPurchaseTo("");
							setPurchasePage(1);
						}}
					>
						Clear filters
					</Button>
				</div>
				{purchasesQuery.isLoading ? (
					<p className="text-sm text-(--v2-ink-soft)">Loading purchases...</p>
				) : null}
				{purchasesQuery.error ? (
					<p className="text-sm text-red-700">Failed to load purchases.</p>
				) : null}
				{!purchasesQuery.isLoading &&
				!purchasesQuery.error &&
				(purchasesQuery.data?.data ?? []).length === 0 ? (
					<p className="text-sm text-(--v2-ink-soft)">No purchases yet.</p>
				) : null}
				{purchaseError ? (
					<p className="text-sm text-red-700">{purchaseError}</p>
				) : null}
				{(purchasesQuery.data?.data ?? []).map((purchase) => (
					<div
						key={purchase.id}
						className="rounded-lg border px-3 py-2 text-sm"
					>
						<div className="flex items-start justify-between gap-2">
							<div>
								<p className="font-medium">
									{toNumber(purchase.quantity).toFixed(2)} {purchase.unit}
								</p>
								<p className="text-(--v2-ink-soft)">
									{formatDate(purchase.occurred_at)}
								</p>
							</div>
							<div className="flex gap-2">
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={() => handleStartEditPurchase(purchase)}
								>
									Edit
								</Button>
								<Button
									type="button"
									variant="destroy"
									size="sm"
									onClick={() => void handleDeletePurchase(purchase.id)}
									disabled={deletingPurchaseId === purchase.id}
								>
									{deletingPurchaseId === purchase.id
										? "Deleting..."
										: "Delete"}
								</Button>
							</div>
						</div>
						{editingPurchaseId === purchase.id ? (
							<div className="mt-3 space-y-2 border-t pt-3">
								<div className="grid gap-2 md:grid-cols-2">
									<Input
										type="datetime-local"
										value={editingPurchaseOccurredAt}
										onChange={(event) =>
											setEditingPurchaseOccurredAt(event.target.value)
										}
									/>
									<Input
										type="number"
										step="0.01"
										value={editingPurchaseQuantity}
										onChange={(event) =>
											setEditingPurchaseQuantity(event.target.value)
										}
									/>
									<Select
										value={editingPurchaseUnit}
										onValueChange={(value) =>
											setEditingPurchaseUnit(value as LivestockEventUnit)
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
									<Input
										type="number"
										step="0.01"
										value={editingPurchaseAmount}
										onChange={(event) =>
											setEditingPurchaseAmount(event.target.value)
										}
									/>
									<Input
										value={editingPurchaseSupplier}
										onChange={(event) =>
											setEditingPurchaseSupplier(event.target.value)
										}
										placeholder="Supplier"
									/>
									<Input
										value={editingPurchaseNotes}
										onChange={(event) =>
											setEditingPurchaseNotes(event.target.value)
										}
										placeholder="Notes"
									/>
								</div>
								<div className="flex justify-end gap-2">
									<Button
										type="button"
										variant="outline"
										onClick={() => setEditingPurchaseId(null)}
									>
										Cancel
									</Button>
									<Button
										type="button"
										onClick={() => void handleSavePurchaseEdit()}
										disabled={updatePurchaseMutation.isPending}
									>
										{updatePurchaseMutation.isPending ? "Saving..." : "Save"}
									</Button>
								</div>
							</div>
						) : null}
					</div>
				))}
				<MaterialPaginationControls
					page={purchasePage}
					hasNext={purchasesQuery.data?.meta.has_next ?? false}
					onPrevious={() =>
						setPurchasePage((current) => Math.max(1, current - 1))
					}
					onNext={() => setPurchasePage((current) => current + 1)}
				/>
			</CardContent>
		</Card>
	);
}
