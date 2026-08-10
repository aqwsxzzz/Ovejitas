import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { REPORT_PERIOD_OPTIONS } from "@/features/reports/hooks/use-report-period";

interface PeriodSelectProps {
	value: string;
	onValueChange: (value: string) => void;
}

/** Compact period dropdown for report card headers/action slots. */
export function PeriodSelect({ value, onValueChange }: PeriodSelectProps) {
	return (
		<Select value={value} onValueChange={onValueChange}>
			<SelectTrigger className="h-8 w-auto gap-1 text-xs">
				<SelectValue />
			</SelectTrigger>
			<SelectContent>
				{REPORT_PERIOD_OPTIONS.map((option) => (
					<SelectItem key={option.value} value={option.value}>
						{option.label}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
