import { useMemo, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useGetProductionProductivityReport } from "@/features/reports/api/reports-queries";
import {
	formatProductionQuantity,
	formatProductivityPct,
} from "@/features/reports/utils/reports-format";

interface ProductionProductivityCardProps {
	farmId: string;
	assetId: number;
	/** Initial window size in days for the productivity calculation. */
	windowDays?: number;
}

// Expected output is time-weighted, so a shorter window scales it down
// proportionally — the report accepts any date range, not just 30 days.
const PERIOD_OPTIONS = [
	{ value: "1", label: "Último día" },
	{ value: "7", label: "Última semana" },
	{ value: "30", label: "Últimos 30 días" },
	{ value: "365", label: "Último año" },
] as const;

export function ProductionProductivityCard({
	farmId,
	assetId,
	windowDays = 30,
}: ProductionProductivityCardProps) {
	const [selectedDays, setSelectedDays] = useState(String(windowDays));

	const { date_from, date_to } = useMemo(() => {
		const now = new Date();
		const from = new Date(now);
		from.setDate(from.getDate() - Number(selectedDays));
		return { date_from: from.toISOString(), date_to: now.toISOString() };
	}, [selectedDays]);

	const { data, isPending } = useGetProductionProductivityReport({
		farmId,
		date_from,
		date_to,
	});

	// The report is farm-wide (one row per asset × product); keep this asset's rows.
	const rows = useMemo(
		() => data?.data.filter((entry) => entry.asset_id === assetId) ?? [],
		[data, assetId],
	);

	// Nothing produced and no target configured for this lot — stay out of the way.
	if (!isPending && rows.length === 0) return null;

	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
				<CardTitle className="text-base">Productividad</CardTitle>
				<Select value={selectedDays} onValueChange={setSelectedDays}>
					<SelectTrigger className="h-8 w-auto gap-1 text-xs">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						{PERIOD_OPTIONS.map((option) => (
							<SelectItem key={option.value} value={option.value}>
								{option.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</CardHeader>
			<CardContent className="space-y-2">
				{isPending ? (
					<p className="text-sm text-(--v2-ink-soft)">Cargando...</p>
				) : (
					rows.map((row) => (
						<div
							key={`${row.category_id}-${row.unit ?? ""}`}
							className="flex items-baseline justify-between gap-3"
						>
							<span className="font-medium">{row.product_name}</span>
							{row.missing_capacity ? (
								<span className="text-sm text-(--v2-ink-soft)">
									Define la meta para calcular la productividad.
								</span>
							) : (
								<span className="text-sm text-(--v2-ink-soft)">
									<span className="text-base font-semibold text-foreground">
										{formatProductivityPct(row.productivity_pct)}
									</span>{" "}
									· {formatProductionQuantity(row.produced, row.unit)}{" "}
									producidos /{" "}
									{formatProductionQuantity(row.expected, row.unit)} esperados
								</span>
							)}
						</div>
					))
				)}
			</CardContent>
		</Card>
	);
}
