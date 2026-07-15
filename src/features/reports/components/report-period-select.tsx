import { useMemo, useState } from "react";

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

// Rolling day windows shared by report cards. Any range is valid on the BE
// reports; these are the presets we expose in the UI.
export const REPORT_PERIOD_OPTIONS = [
	{ value: "1", label: "Último día" },
	{ value: "7", label: "Última semana" },
	{ value: "30", label: "Últimos 30 días" },
	{ value: "365", label: "Último año" },
] as const;

export interface ReportPeriod {
	selectedDays: string;
	setSelectedDays: (value: string) => void;
	date_from: string;
	date_to: string;
}

/** Rolling-window period state as ISO date_from/date_to, driven by a day count. */
export function useReportPeriod(defaultDays = 30): ReportPeriod {
	const [selectedDays, setSelectedDays] = useState(String(defaultDays));

	const { date_from, date_to } = useMemo(() => {
		const now = new Date();
		const from = new Date(now);
		from.setDate(from.getDate() - Number(selectedDays));
		return { date_from: from.toISOString(), date_to: now.toISOString() };
	}, [selectedDays]);

	return { selectedDays, setSelectedDays, date_from, date_to };
}

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
