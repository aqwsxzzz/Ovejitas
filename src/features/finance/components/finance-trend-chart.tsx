import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/features/finance/finance-utils";

export interface FinanceTrendRow {
	label: string;
	income: number;
	expense: number;
	net: number;
}

export interface FinanceTrendSection {
	currency: string;
	rows: FinanceTrendRow[];
}

interface FinanceTrendChartProps {
	sections: FinanceTrendSection[];
	isPending: boolean;
	errorMessage?: string;
	blockedMessage?: string;
}

export const FinanceTrendChart = ({
	sections,
	isPending,
	errorMessage,
	blockedMessage,
}: FinanceTrendChartProps) => (
	<Card className="v2-card">
		<CardHeader>
			<div className="flex items-center justify-between gap-3">
				<CardTitle className="text-lg">Tendencia de caja</CardTitle>
				<div className="flex items-center gap-2 text-xs text-muted-foreground">
					<span className="inline-flex items-center gap-1">
						<span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
						Ingresos
					</span>
					<span className="inline-flex items-center gap-1">
						<span className="h-2.5 w-2.5 rounded-full bg-red-500" />
						Gastos
					</span>
				</div>
			</div>
		</CardHeader>
		<CardContent className="space-y-4">
			{blockedMessage ? (
				<p className="text-sm text-muted-foreground">{blockedMessage}</p>
			) : isPending ? (
				<p className="text-sm text-muted-foreground">Cargando tendencia...</p>
			) : errorMessage ? (
				<p className="text-sm text-destructive">{errorMessage}</p>
			) : sections.length === 0 ? (
				<p className="text-sm text-muted-foreground">
					No hay movimientos monetarios para el rango seleccionado.
				</p>
			) : (
				sections.map((section) => {
					const maxValue = Math.max(
						...section.rows.flatMap((row) => [row.income, row.expense]),
						1,
					);

					return (
						<div
							key={section.currency}
							className="space-y-3 rounded-xl border p-4"
						>
							<Badge variant="outline">{section.currency}</Badge>
							<div className="space-y-3">
								{section.rows.map((row) => (
									<div
										key={`${section.currency}-${row.label}`}
										className="grid grid-cols-[72px_1fr_auto] gap-3 text-sm"
									>
										<span className="text-muted-foreground">{row.label}</span>
										<div className="space-y-1.5">
											<div className="h-2 overflow-hidden rounded-full bg-emerald-100">
												<div
													className="h-full rounded-full bg-emerald-500"
													style={{ width: `${(row.income / maxValue) * 100}%` }}
												/>
											</div>
											<div className="h-2 overflow-hidden rounded-full bg-red-100">
												<div
													className="h-full rounded-full bg-red-500"
													style={{ width: `${(row.expense / maxValue) * 100}%` }}
												/>
											</div>
										</div>
										<span className={row.net >= 0 ? "text-emerald-700" : "text-red-700"}>
											{formatCurrency(row.net, section.currency)}
										</span>
									</div>
								))}
							</div>
						</div>
					);
				})
			)}
		</CardContent>
	</Card>
);