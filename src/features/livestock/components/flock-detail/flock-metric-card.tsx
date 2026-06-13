import { Loader2 } from "lucide-react";

interface FlockMetricCardProps {
	label: string;
	value: string;
	note: string;
	isLoading?: boolean;
}

export function FlockMetricCard({
	label,
	value,
	note,
	isLoading,
}: FlockMetricCardProps) {
	return (
		<div className="v2-card flex-1 p-3">
			<p className="text-[10px] uppercase tracking-[0.08em] text-(--v2-ink-soft)">
				{label}
			</p>
			<p className="mt-1 text-2xl font-semibold leading-none">
				{isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : value}
			</p>
			<p className="mt-1 text-sm text-(--v2-ink-soft)">{note}</p>
		</div>
	);
}
