import { useCallback, useMemo, useState } from "react";
import type { ComponentProps } from "react";

import {
	useCreateMaterialConsumptionByFarmId,
	useCreateMaterialPurchaseByFarmId,
	useCreateMaterialSaleByAssetId,
	useListLivestockAssetsByFarmId,
} from "@/features/livestock/api/livestock-queries";
import { getMaterialActionErrorMessage } from "@/features/inventory/components/material-action-utils";
import { MaterialConsumptionForm } from "@/features/inventory/components/material-consumption-form";
import { MaterialPurchaseForm } from "@/features/inventory/components/material-purchase-form";
import { MaterialSaleForm } from "@/features/inventory/components/material-sale-form";
import { useGetInventorySummaryReport } from "@/features/reports/api/reports-queries";

import type { MaterialActionMode } from "./flock-detail-types";
import { parseNumeric } from "./flock-detail-utils";

interface UseFlockMaterialActionsParams {
	farmId: string;
	unitId: string;
	assetId: number;
}

export function useFlockMaterialActions({
	farmId,
	unitId,
	assetId,
}: UseFlockMaterialActionsParams) {
	const [materialActionMode, setMaterialActionMode] =
		useState<MaterialActionMode | null>(null);
	const [materialPurchaseError, setMaterialPurchaseError] = useState<
		string | null
	>(null);
	const [materialConsumptionError, setMaterialConsumptionError] = useState<
		string | null
	>(null);
	const [materialSaleError, setMaterialSaleError] = useState<string | null>(
		null,
	);

	const { data: inventorySummaryReport } = useGetInventorySummaryReport(
		{ farmId, asset_id: assetId },
		!!farmId,
	);
	const { data: consumerAssetsResponse } = useListLivestockAssetsByFarmId({
		farmId,
		filters: { kind: "animal", pageSize: 100 },
		enabled: !!farmId,
	});

	const createMaterialPurchaseMutation = useCreateMaterialPurchaseByFarmId();
	const createMaterialConsumptionMutation =
		useCreateMaterialConsumptionByFarmId();
	const createMaterialSaleMutation = useCreateMaterialSaleByAssetId();

	const inventoryRows = useMemo(
		() =>
			(inventorySummaryReport?.data ?? []).map((row) => ({
				...row,
				onHand: parseNumeric(row.on_hand),
			})),
		[inventorySummaryReport],
	);
	const consumerAssets = useMemo(
		() =>
			(consumerAssetsResponse?.data ?? []).map((item) => ({
				id: item.id,
				name: item.name,
			})),
		[consumerAssetsResponse?.data],
	);
	const totalOnHand = useMemo(
		() => inventoryRows.reduce((sum, row) => sum + row.onHand, 0),
		[inventoryRows],
	);
	const inventoryStatus = useMemo<"ok" | "low" | "critical">(() => {
		if (!inventoryRows.length) return "critical";
		if (totalOnHand <= 0) return "critical";
		if (totalOnHand <= 10) return "low";
		return "ok";
	}, [inventoryRows.length, totalOnHand]);
	const materialActionTitle =
		materialActionMode === "purchase"
			? "Registrar compra"
			: materialActionMode === "consumption"
				? "Registrar consumo"
				: "Registrar venta";

	const closeMaterialActionPanel = useCallback(() => {
		setMaterialActionMode(null);
		setMaterialPurchaseError(null);
		setMaterialConsumptionError(null);
		setMaterialSaleError(null);
	}, []);
	const openMaterialActionPanel = useCallback((mode: MaterialActionMode) => {
		setMaterialActionMode(mode);
		setMaterialPurchaseError(null);
		setMaterialConsumptionError(null);
		setMaterialSaleError(null);
	}, []);

	const handleSubmitMaterialPurchase: ComponentProps<
		typeof MaterialPurchaseForm
	>["onSubmit"] = useCallback(
		async (payload) => {
			setMaterialPurchaseError(null);
			try {
				await createMaterialPurchaseMutation.mutateAsync({
					farmId,
					data: payload,
				});
				closeMaterialActionPanel();
			} catch (error) {
				setMaterialPurchaseError(
					getMaterialActionErrorMessage(
						error,
						"No se pudo registrar la compra de material.",
					),
				);
			}
		},
		[farmId, createMaterialPurchaseMutation, closeMaterialActionPanel],
	);
	const handleSubmitMaterialConsumption: ComponentProps<
		typeof MaterialConsumptionForm
	>["onSubmit"] = useCallback(
		async (payload) => {
			setMaterialConsumptionError(null);
			try {
				await createMaterialConsumptionMutation.mutateAsync({
					farmId,
					data: payload,
				});
				closeMaterialActionPanel();
			} catch (error) {
				setMaterialConsumptionError(
					getMaterialActionErrorMessage(
						error,
						"No se pudo registrar el consumo de material.",
					),
				);
			}
		},
		[farmId, createMaterialConsumptionMutation, closeMaterialActionPanel],
	);
	const handleSubmitMaterialSale: ComponentProps<
		typeof MaterialSaleForm
	>["onSubmit"] = useCallback(
		async (payload) => {
			setMaterialSaleError(null);
			try {
				await createMaterialSaleMutation.mutateAsync({
					farmId,
					assetId: unitId,
					data: payload,
				});
				closeMaterialActionPanel();
			} catch (error) {
				setMaterialSaleError(
					getMaterialActionErrorMessage(
						error,
						"No se pudo registrar la venta de material.",
					),
				);
			}
		},
		[farmId, unitId, createMaterialSaleMutation, closeMaterialActionPanel],
	);

	return {
		materialActionMode,
		materialActionTitle,
		materialPurchaseError,
		materialConsumptionError,
		materialSaleError,
		inventoryRows,
		consumerAssets,
		inventoryStatus,
		openMaterialActionPanel,
		closeMaterialActionPanel,
		handleSubmitMaterialPurchase,
		handleSubmitMaterialConsumption,
		handleSubmitMaterialSale,
		isSubmittingPurchase: createMaterialPurchaseMutation.isPending,
		isSubmittingConsumption: createMaterialConsumptionMutation.isPending,
		isSubmittingSale: createMaterialSaleMutation.isPending,
	};
}
