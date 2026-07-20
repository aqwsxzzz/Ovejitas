import type { IMaterialConsumptionRead } from "@/features/livestock/types/livestock-types";
import { EVENT_UNIT_LABELS } from "@/shared/types/unit-types";
import { formatDate } from "@/features/inventory/components/material-detail-utils";

interface ManualFeedingHistoryRowProps {
	row: IMaterialConsumptionRead;
	materialName: string;
}

export function ManualFeedingHistoryRow({
	row,
	materialName,
}: ManualFeedingHistoryRowProps) {
	return (
		<div className="rounded-lg border border-(--v2-border) bg-(--v2-surface) px-3 py-2 text-sm">
			<div className="flex items-start justify-between gap-2">
				<p className="font-medium">{materialName}</p>
				<p className="font-semibold whitespace-nowrap">
					{Number(row.quantity).toFixed(2)} {EVENT_UNIT_LABELS[row.unit]}
				</p>
			</div>
			<p className="text-xs text-(--v2-ink-soft)">{formatDate(row.occurred_at)}</p>
			{row.notes ? (
				<p className="mt-1 text-xs text-(--v2-ink-soft)">{row.notes}</p>
			) : null}
		</div>
	);
}
