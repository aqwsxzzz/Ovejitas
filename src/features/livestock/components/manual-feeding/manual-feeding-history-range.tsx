import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ManualFeedingHistoryRangeProps {
	from: string;
	to: string;
	onFromChange: (value: string) => void;
	onToChange: (value: string) => void;
}

export function ManualFeedingHistoryRange({
	from,
	to,
	onFromChange,
	onToChange,
}: ManualFeedingHistoryRangeProps) {
	return (
		<div className="grid gap-2 sm:grid-cols-2">
			<div className="space-y-1">
				<Label htmlFor="feeding-history-from">Desde</Label>
				<Input
					id="feeding-history-from"
					type="date"
					value={from}
					max={to || undefined}
					onChange={(event) => onFromChange(event.target.value)}
				/>
			</div>
			<div className="space-y-1">
				<Label htmlFor="feeding-history-to">Hasta</Label>
				<Input
					id="feeding-history-to"
					type="date"
					value={to}
					min={from || undefined}
					onChange={(event) => onToChange(event.target.value)}
				/>
			</div>
		</div>
	);
}
