import { useMemo, useState } from "react";
import type { ComponentProps } from "react";
import { Link } from "@tanstack/react-router";
import { Package } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useGetUserProfile } from "@/features/auth/api/auth-queries";
import {
	useGetProfitabilityReport,
	useGetInventorySummaryReport,
	useGetMaterialConsumptionAggregateReport,
} from "@/features/reports/api/reports-queries";
import {
	useCreateMaterialConsumptionByFarmId,
	useCreateMaterialPurchaseByFarmId,
	useCreateMaterialSaleByAssetId,
	useGetInventoryBalanceByAssetId,
	useGetLivestockAssetById,
	useListEventCategoriesByFarmId,
	useListLivestockAssetsByFarmId,
} from "@/features/livestock/api/livestock-queries";
import { MaterialConsumptionForm } from "@/features/inventory/components/material-consumption-form";
import { MaterialPurchaseForm } from "@/features/inventory/components/material-purchase-form";
import { MaterialSaleForm } from "@/features/inventory/components/material-sale-form";
import { MaterialTimelinePanel } from "@/features/inventory/components/material-timeline-panel";
import { MaterialPurchasesPanel } from "@/features/inventory/components/material-purchases-panel";
import { MaterialConsumptionsPanel } from "@/features/inventory/components/material-consumptions-panel";
import { getMaterialActionErrorMessage } from "@/features/inventory/components/material-action-utils";
import {
	formatDate,
	toNumber,
} from "@/features/inventory/components/material-detail-utils";

interface MaterialDetailPageProps {
	materialId: string;
}

export function MaterialDetailPage({ materialId }: MaterialDetailPageProps) {
	const parsedAssetId = Number(materialId);
	const hasValidAssetId = Number.isInteger(parsedAssetId);
	const { data: currentUser } = useGetUserProfile();
	const farmId = currentUser?.lastVisitedFarmId ?? "";

	const [purchaseError, setPurchaseError] = useState<string | null>(null);
	const [consumptionError, setConsumptionError] = useState<string | null>(null);
	const [saleError, setSaleError] = useState<string | null>(null);

	const { data: asset, isLoading: isLoadingAsset } = useGetLivestockAssetById({
		farmId,
		assetId: parsedAssetId,
		enabled: !!farmId && hasValidAssetId,
	});
	const balanceQuery = useGetInventoryBalanceByAssetId({
		farmId,
		assetId: materialId,
		enabled: !!farmId && hasValidAssetId,
	});
	const linkedProduceAssetId = asset?.produce_asset_id ?? null;
	const linkedProduceQuery = useGetLivestockAssetById({
		farmId,
		assetId: linkedProduceAssetId ?? Number.NaN,
		enabled:
			!!farmId &&
			linkedProduceAssetId !== null &&
			Number.isInteger(linkedProduceAssetId),
	});

	const inventorySummaryQuery = useGetInventorySummaryReport(
		{
			farmId,
			asset_id: parsedAssetId,
		},
		!!farmId && hasValidAssetId,
	);
	const profitabilityQuery = useGetProfitabilityReport(
		{
			farmId,
			asset_id: parsedAssetId,
		},
		!!farmId && hasValidAssetId,
	);
	const consumptionAggregateQuery = useGetMaterialConsumptionAggregateReport(
		{
			farmId,
			bucket: "day",
			group_by: "material",
			material_asset_id: parsedAssetId,
		},
		!!farmId && hasValidAssetId,
	);
	const consumerAssetsQuery = useListLivestockAssetsByFarmId({
		farmId,
		filters: { kind: "animal", page: 1, pageSize: 100 },
		enabled: !!farmId,
	});
	const incomeCategoriesQuery = useListEventCategoriesByFarmId({
		farmId,
		filters: { type: "income", archived: false, page: 1, pageSize: 100 },
		enabled: !!farmId,
	});

	const createPurchaseMutation = useCreateMaterialPurchaseByFarmId();
	const createConsumptionMutation = useCreateMaterialConsumptionByFarmId();
	const createSaleMutation = useCreateMaterialSaleByAssetId();

	const inventoryRows = useMemo(
		() => inventorySummaryQuery.data?.data ?? [],
		[inventorySummaryQuery.data?.data],
	);
	const balanceRows = useMemo(
		() => balanceQuery.data?.balances ?? [],
		[balanceQuery.data?.balances],
	);
	const aggregateTotals = useMemo(
		() => consumptionAggregateQuery.data?.totals ?? [],
		[consumptionAggregateQuery.data?.totals],
	);
	const profitabilityTotals = useMemo(
		() => profitabilityQuery.data?.totals ?? [],
		[profitabilityQuery.data?.totals],
	);

	const handlePurchaseSubmit: ComponentProps<
		typeof MaterialPurchaseForm
	>["onSubmit"] = async (payload) => {
		setPurchaseError(null);
		try {
			await createPurchaseMutation.mutateAsync({ farmId, data: payload });
		} catch (error) {
			setPurchaseError(
				getMaterialActionErrorMessage(error, "Failed to register purchase."),
			);
		}
	};

	const handleConsumptionSubmit: ComponentProps<
		typeof MaterialConsumptionForm
	>["onSubmit"] = async (payload) => {
		setConsumptionError(null);
		try {
			await createConsumptionMutation.mutateAsync({ farmId, data: payload });
		} catch (error) {
			setConsumptionError(
				getMaterialActionErrorMessage(error, "Failed to register consumption."),
			);
		}
	};

	const handleSaleSubmit: ComponentProps<
		typeof MaterialSaleForm
	>["onSubmit"] = async (payload) => {
		setSaleError(null);
		try {
			await createSaleMutation.mutateAsync({
				farmId,
				assetId: materialId,
				data: payload,
			});
		} catch (error) {
			setSaleError(
				getMaterialActionErrorMessage(error, "Failed to register sale."),
			);
		}
	};

	if (!farmId) {
		return (
			<p className="text-sm text-(--v2-ink-soft)">
				Select a farm to load material details.
			</p>
		);
	}

	if (!hasValidAssetId) {
		return <p className="text-sm text-red-700">Invalid material id.</p>;
	}

	if (isLoadingAsset) {
		return <p className="text-sm text-(--v2-ink-soft)">Loading material...</p>;
	}

	if (!asset || asset.kind !== "material") {
		return (
			<div className="space-y-2">
				<p className="text-sm text-red-700">Material asset not found.</p>
				<Link
					to="/v2/inventory"
					className="text-sm underline"
				>
					Return to inventory
				</Link>
			</div>
		);
	}

	return (
		<section className="space-y-4">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-2xl">
						<Package className="h-6 w-6" />
						{asset.name}
					</CardTitle>
					<p className="text-sm text-(--v2-ink-soft)">
						{asset.location ?? "No location"} · {asset.mode} mode
					</p>
					{asset.produce_asset_id ? (
						<p className="text-sm text-(--v2-ink-soft)">
							Linked produce asset:{" "}
							{linkedProduceQuery.isLoading
								? `#${asset.produce_asset_id}`
								: linkedProduceQuery.data?.name || `#${asset.produce_asset_id}`}
						</p>
					) : null}
					{asset.description ? (
						<p className="text-sm">{asset.description}</p>
					) : null}
				</CardHeader>
				<CardContent className="space-y-3">
					<p className="text-sm font-medium">On-hand snapshot</p>
					{balanceQuery.isLoading ? (
						<p className="text-sm text-(--v2-ink-soft)">Loading balance...</p>
					) : balanceQuery.error ? (
						<p className="text-sm text-red-700">Failed to load balance.</p>
					) : balanceRows.length ? (
						<div className="space-y-2">
							{balanceRows.map((row) => (
								<div
									key={row.unit}
									className="rounded-lg border px-3 py-2"
								>
									<div className="flex items-center justify-between">
										<span className="text-sm">{row.unit}</span>
										<span className="text-sm font-semibold">
											{toNumber(row.on_hand).toFixed(2)}
										</span>
									</div>
									<p className="mt-1 text-xs text-(--v2-ink-soft)">
										Last reset:{" "}
										{row.last_reset_at
											? formatDate(row.last_reset_at)
											: "Never"}
									</p>
								</div>
							))}
						</div>
					) : inventoryRows.length ? (
						<div className="space-y-2">
							{inventoryRows.map((row) => (
								<div
									key={`${row.asset_id}-${row.unit}`}
									className="flex items-center justify-between rounded-lg border px-3 py-2"
								>
									<span className="text-sm">{row.unit}</span>
									<span className="text-sm font-semibold">
										{toNumber(row.on_hand).toFixed(2)}
									</span>
								</div>
							))}
						</div>
					) : (
						<p className="text-sm text-(--v2-ink-soft)">
							No inventory balance yet.
						</p>
					)}
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Financial Snapshot</CardTitle>
				</CardHeader>
				<CardContent className="space-y-2">
					{profitabilityQuery.isLoading ? (
						<p className="text-sm text-(--v2-ink-soft)">
							Loading financial snapshot...
						</p>
					) : null}
					{profitabilityQuery.error ? (
						<p className="text-sm text-red-700">
							Failed to load financial snapshot.
						</p>
					) : null}
					{!profitabilityQuery.isLoading &&
					!profitabilityQuery.error &&
					profitabilityTotals.length === 0 ? (
						<p className="text-sm text-(--v2-ink-soft)">
							No purchase or sale totals yet.
						</p>
					) : null}
					{profitabilityTotals.map((total) => (
						<div
							key={total.currency}
							className="rounded-lg border px-3 py-3"
						>
							<div className="flex items-center justify-between text-sm">
								<span className="text-(--v2-ink-soft)">Currency</span>
								<span className="font-semibold">{total.currency}</span>
							</div>
							<div className="mt-3 grid gap-2 md:grid-cols-3">
								<div className="rounded-lg bg-red-50 px-3 py-2">
									<p className="text-xs uppercase tracking-[0.08em] text-red-700">
										Purchases
									</p>
									<p className="text-base font-semibold">
										{toNumber(total.expense_total).toFixed(2)}
									</p>
								</div>
								<div className="rounded-lg bg-emerald-50 px-3 py-2">
									<p className="text-xs uppercase tracking-[0.08em] text-emerald-700">
										Sales
									</p>
									<p className="text-base font-semibold">
										{toNumber(total.income_total).toFixed(2)}
									</p>
								</div>
								<div className="rounded-lg bg-(--v2-surface) px-3 py-2">
									<p className="text-xs uppercase tracking-[0.08em] text-(--v2-ink-soft)">
										Net
									</p>
									<p className="text-base font-semibold">
										{toNumber(total.net).toFixed(2)}
									</p>
								</div>
							</div>
						</div>
					))}
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Reports Snapshot (Consumption)</CardTitle>
				</CardHeader>
				<CardContent className="space-y-2">
					{consumptionAggregateQuery.isLoading ? (
						<p className="text-sm text-(--v2-ink-soft)">
							Loading report snapshot...
						</p>
					) : null}
					{consumptionAggregateQuery.error ? (
						<p className="text-sm text-red-700">
							Failed to load consumption aggregate report.
						</p>
					) : null}
					{!consumptionAggregateQuery.isLoading &&
					!consumptionAggregateQuery.error &&
					aggregateTotals.length === 0 ? (
						<p className="text-sm text-(--v2-ink-soft)">
							No consumption totals yet.
						</p>
					) : null}
					{aggregateTotals.map((total) => (
						<div
							key={`${total.group ?? "all"}-${total.unit}`}
							className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
						>
							<span>{total.group_label ?? "Material"}</span>
							<span className="font-semibold">
								{toNumber(total.total_qty).toFixed(2)} {total.unit}
							</span>
						</div>
					))}
				</CardContent>
			</Card>

			<div className="grid gap-4 lg:grid-cols-3">
				<Card>
					<CardHeader>
						<CardTitle>Register Purchase</CardTitle>
					</CardHeader>
					<CardContent>
						<MaterialPurchaseForm
							materialAssetId={asset.id}
							isSubmitting={createPurchaseMutation.isPending}
							errorMessage={purchaseError}
							onSubmit={handlePurchaseSubmit}
						/>
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle>Register Consumption</CardTitle>
					</CardHeader>
					<CardContent>
						<MaterialConsumptionForm
							farmId={farmId}
							materialAssetId={asset.id}
							consumerAssets={(consumerAssetsQuery.data?.data ?? []).map(
								(item) => ({
									id: item.id,
									name: item.name,
								}),
							)}
							isSubmitting={createConsumptionMutation.isPending}
							errorMessage={consumptionError}
							onSubmit={handleConsumptionSubmit}
						/>
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle>Register Sale</CardTitle>
					</CardHeader>
					<CardContent>
						<MaterialSaleForm
							categoryOptions={(incomeCategoriesQuery.data ?? []).map(
								(item) => ({
									id: item.id,
									name: item.name,
								}),
							)}
							isSubmitting={createSaleMutation.isPending}
							errorMessage={saleError}
							onSubmit={handleSaleSubmit}
						/>
					</CardContent>
				</Card>
			</div>

			<MaterialTimelinePanel
				farmId={farmId}
				materialId={materialId}
			/>

			<div className="grid gap-4 lg:grid-cols-2">
				<MaterialPurchasesPanel
					farmId={farmId}
					materialAssetId={asset.id}
				/>
				<MaterialConsumptionsPanel
					farmId={farmId}
					materialAssetId={asset.id}
				/>
			</div>

			<Separator />
			<Link
				to="/v2/inventory"
				className="text-sm underline"
			>
				Back to inventory
			</Link>
		</section>
	);
}
