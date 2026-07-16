import { Button } from "@/components/ui/button";
import { MetricBreakdownCard } from "@/components/common/metric-breakdown-card";

import { FlockHeadcountAdjustmentForm } from "./flock-headcount-adjustment-form";
import { useFlockHeadcountAdjustment } from "./use-flock-headcount-adjustment";

interface FlockHeadcountAdjustmentCardProps {
	farmId: string;
	unitId: string;
}

export function FlockHeadcountAdjustmentCard({
	farmId,
	unitId,
}: FlockHeadcountAdjustmentCardProps) {
	const adjustment = useFlockHeadcountAdjustment({ farmId, unitId });

	return (
		<MetricBreakdownCard
			label="Existencia actual"
			value={String(adjustment.aggregatedActiveCount)}
			isLoading={adjustment.isAggregatedHeadcountPending}
			action={
				!adjustment.isAdjustingHeadcount ? (
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={adjustment.openHeadcountAdjustment}
					>
						Ajustar
					</Button>
				) : undefined
			}
		>
			{adjustment.isAdjustingHeadcount ? (
				<FlockHeadcountAdjustmentForm adjustment={adjustment} />
			) : null}
		</MetricBreakdownCard>
	);
}
