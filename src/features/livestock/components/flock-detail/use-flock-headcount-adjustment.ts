import { useCallback, useMemo, useState } from "react";

import {
	useCreateFlockAcquisitionByAssetId,
	useCreateFlockMortalityByAssetId,
	useCreateFlockSaleByAssetId,
	useGetAggregatedHeadcountByAssetId,
} from "@/features/livestock/api/livestock-queries";

import {
	isBackdatedDraft,
	parseHeadcount,
	resolveFlockMovement,
	resolveOccurredAt,
	resolvePendingKind,
	toDateInputValue,
	type FlockMovement,
	type FlockMovementKind,
} from "./flock-headcount-movement";
import {
	useFlockHeadcountDrafts,
	type FlockHeadcountDrafts,
} from "./use-flock-headcount-drafts";

const MORTALITY_CAUSE = "Ajuste manual de conteo";

interface UseFlockHeadcountAdjustmentParams {
	farmId: string;
	unitId: string;
}

export interface UseFlockHeadcountAdjustmentResult {
	isAdjustingHeadcount: boolean;
	drafts: FlockHeadcountDrafts;
	patchDrafts: (patch: Partial<FlockHeadcountDrafts>) => void;
	headcountError: string;
	aggregatedActiveCount: number;
	isAggregatedHeadcountPending: boolean;
	isBackdated: boolean;
	/** Upper bound for the date field — the flock can't change before it happens. */
	todayValue: string;
	headcountDeltaPreview: number | null;
	pendingKind: FlockMovementKind | null;
	openHeadcountAdjustment: () => void;
	closeHeadcountAdjustment: () => void;
	handleApplyHeadcountAdjustment: () => Promise<void>;
	isApplying: boolean;
}

export function useFlockHeadcountAdjustment({
	farmId,
	unitId,
}: UseFlockHeadcountAdjustmentParams): UseFlockHeadcountAdjustmentResult {
	const [isAdjustingHeadcount, setIsAdjustingHeadcount] = useState(false);
	const [headcountError, setHeadcountError] = useState("");
	const { drafts, patchDrafts, resetDrafts } = useFlockHeadcountDrafts();

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
	const todayValue = toDateInputValue(new Date());
	const isBackdated = useMemo(
		() => isBackdatedDraft(drafts.occurredOn, new Date()),
		[drafts.occurredOn],
	);
	const headcountDeltaPreview = useMemo(() => {
		if (isBackdated) return null;
		const target = parseHeadcount(drafts.target);
		return target == null ? null : target - aggregatedActiveCount;
	}, [isBackdated, drafts.target, aggregatedActiveCount]);
	const pendingKind = resolvePendingKind(
		{
			isBackdated,
			movementType: drafts.movementType,
			decreaseMode: drafts.decreaseMode,
		},
		headcountDeltaPreview,
	);

	const openHeadcountAdjustment = useCallback(() => {
		setHeadcountError("");
		resetDrafts(aggregatedActiveCount);
		setIsAdjustingHeadcount(true);
	}, [aggregatedActiveCount, resetDrafts]);
	const closeHeadcountAdjustment = useCallback(() => {
		setIsAdjustingHeadcount(false);
		setHeadcountError("");
	}, []);

	const submitMovement = useCallback(
		async (movement: FlockMovement, occurredAt: string) => {
			const target = { farmId, assetId: unitId };
			switch (movement.kind) {
				case "acquisition":
					await createFlockAcquisitionMutation.mutateAsync({
						...target,
						payload: {
							occurred_at: occurredAt,
							quantity: movement.quantity,
							amount: movement.amount,
						},
					});
					return;
				case "sale":
					await createFlockSaleMutation.mutateAsync({
						...target,
						payload: {
							occurred_at: occurredAt,
							quantity: movement.quantity,
							amount: movement.amount,
						},
					});
					return;
				case "mortality":
					await createFlockMortalityMutation.mutateAsync({
						...target,
						payload: {
							occurred_at: occurredAt,
							quantity: movement.quantity,
							cause: MORTALITY_CAUSE,
						},
					});
					return;
				default: {
					const exhaustive: never = movement;
					return exhaustive;
				}
			}
		},
		[
			farmId,
			unitId,
			createFlockAcquisitionMutation,
			createFlockSaleMutation,
			createFlockMortalityMutation,
		],
	);

	const handleApplyHeadcountAdjustment = useCallback(async () => {
		const occurredAt = resolveOccurredAt(drafts.occurredOn, new Date());
		if (occurredAt == null) {
			return setHeadcountError("Ingresa una fecha valida.");
		}

		const result = resolveFlockMovement({
			isBackdated,
			currentCount: aggregatedActiveCount,
			targetDraft: drafts.target,
			quantityDraft: drafts.quantity,
			amountDraft: drafts.amount,
			decreaseMode: drafts.decreaseMode,
			movementType: drafts.movementType,
		});
		if (result.status === "error") return setHeadcountError(result.message);
		if (result.status === "noop") return closeHeadcountAdjustment();

		setHeadcountError("");
		await submitMovement(result.movement, occurredAt.toISOString());
		closeHeadcountAdjustment();
	}, [
		drafts,
		isBackdated,
		aggregatedActiveCount,
		submitMovement,
		closeHeadcountAdjustment,
	]);

	return {
		isAdjustingHeadcount,
		drafts,
		patchDrafts,
		headcountError,
		aggregatedActiveCount,
		isAggregatedHeadcountPending,
		isBackdated,
		todayValue,
		headcountDeltaPreview,
		pendingKind,
		openHeadcountAdjustment,
		closeHeadcountAdjustment,
		handleApplyHeadcountAdjustment,
		isApplying:
			createFlockAcquisitionMutation.isPending ||
			createFlockSaleMutation.isPending ||
			createFlockMortalityMutation.isPending,
	};
}
