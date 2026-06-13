import { useCallback, useMemo, useState } from "react";

import {
	useCreateFlockAcquisitionByAssetId,
	useCreateFlockMortalityByAssetId,
	useCreateFlockSaleByAssetId,
	useGetAggregatedHeadcountByAssetId,
} from "@/features/livestock/api/livestock-queries";

interface UseFlockHeadcountAdjustmentParams {
	farmId: string;
	unitId: string;
}

export function useFlockHeadcountAdjustment({
	farmId,
	unitId,
}: UseFlockHeadcountAdjustmentParams) {
	const [isAdjustingHeadcount, setIsAdjustingHeadcount] = useState(false);
	const [headcountDraft, setHeadcountDraft] = useState("");
	const [headcountAmountDraft, setHeadcountAmountDraft] = useState("");
	const [headcountDecreaseMode, setHeadcountDecreaseMode] = useState<
		"mortality" | "sale"
	>("mortality");
	const [headcountError, setHeadcountError] = useState("");

	const { data: aggregatedHeadcount, isPending: isAggregatedHeadcountPending } =
		useGetAggregatedHeadcountByAssetId({
			farmId,
			assetId: unitId,
			enabled: !!farmId && !!unitId,
		});
	const createFlockAcquisitionMutation = useCreateFlockAcquisitionByAssetId();
	const createFlockSaleMutation = useCreateFlockSaleByAssetId();
	const createFlockMortalityMutation = useCreateFlockMortalityByAssetId();

	const aggregatedActiveCount = aggregatedHeadcount?.net ?? 0;
	const parsedHeadcountTarget = useMemo(() => {
		const parsed = Number(headcountDraft);
		if (!Number.isFinite(parsed)) return null;
		return Math.max(0, Math.floor(parsed));
	}, [headcountDraft]);
	const headcountDeltaPreview = useMemo(() => {
		if (parsedHeadcountTarget == null) return null;
		return parsedHeadcountTarget - aggregatedActiveCount;
	}, [parsedHeadcountTarget, aggregatedActiveCount]);

	const openHeadcountAdjustment = useCallback(() => {
		setHeadcountError("");
		setHeadcountDraft(String(aggregatedActiveCount));
		setHeadcountAmountDraft("");
		setHeadcountDecreaseMode("mortality");
		setIsAdjustingHeadcount(true);
	}, [aggregatedActiveCount]);
	const closeHeadcountAdjustment = useCallback(() => {
		setIsAdjustingHeadcount(false);
		setHeadcountError("");
		setHeadcountAmountDraft("");
		setHeadcountDecreaseMode("mortality");
	}, []);

	const handleApplyHeadcountAdjustment = useCallback(async () => {
		const parsedTarget = Number(headcountDraft);
		const target = Number.isFinite(parsedTarget)
			? Math.max(0, Math.floor(parsedTarget))
			: NaN;
		if (!Number.isFinite(target))
			return setHeadcountError("Ingresa un conteo valido.");

		const delta = target - aggregatedActiveCount;
		if (delta === 0) return closeHeadcountAdjustment();

		setHeadcountError("");
		if (delta > 0) {
			const parsedAmount = Number(headcountAmountDraft);
			const hasAmount = headcountAmountDraft.trim().length > 0;
			if (hasAmount && (!Number.isFinite(parsedAmount) || parsedAmount < 0)) {
				return setHeadcountError("Ingresa un costo valido o dejalo vacio.");
			}
			await createFlockAcquisitionMutation.mutateAsync({
				farmId,
				assetId: unitId,
				payload: {
					occurred_at: new Date().toISOString(),
					quantity: delta,
					amount: hasAmount ? parsedAmount : null,
				},
			});
			return closeHeadcountAdjustment();
		}

		if (headcountDecreaseMode === "sale") {
			const parsedAmount = Number(headcountAmountDraft);
			if (
				headcountAmountDraft.trim().length === 0 ||
				!Number.isFinite(parsedAmount) ||
				parsedAmount < 0
			) {
				return setHeadcountError(
					"Para una venta debes ingresar un ingreso valido.",
				);
			}
			await createFlockSaleMutation.mutateAsync({
				farmId,
				assetId: unitId,
				payload: {
					occurred_at: new Date().toISOString(),
					quantity: Math.abs(delta),
					amount: parsedAmount,
				},
			});
			return closeHeadcountAdjustment();
		}

		await createFlockMortalityMutation.mutateAsync({
			farmId,
			assetId: unitId,
			payload: {
				occurred_at: new Date().toISOString(),
				quantity: Math.abs(delta),
				cause: "Ajuste manual de conteo",
			},
		});
		closeHeadcountAdjustment();
	}, [
		farmId,
		unitId,
		headcountDraft,
		headcountAmountDraft,
		headcountDecreaseMode,
		aggregatedActiveCount,
		createFlockAcquisitionMutation,
		createFlockSaleMutation,
		createFlockMortalityMutation,
		closeHeadcountAdjustment,
	]);

	return {
		isAdjustingHeadcount,
		headcountDraft,
		headcountAmountDraft,
		headcountDecreaseMode,
		headcountError,
		aggregatedActiveCount,
		isAggregatedHeadcountPending,
		headcountDeltaPreview,
		setHeadcountDraft,
		setHeadcountAmountDraft,
		setHeadcountDecreaseMode,
		openHeadcountAdjustment,
		closeHeadcountAdjustment,
		handleApplyHeadcountAdjustment,
		isApplying:
			createFlockAcquisitionMutation.isPending ||
			createFlockSaleMutation.isPending ||
			createFlockMortalityMutation.isPending,
	};
}
