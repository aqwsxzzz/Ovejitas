import {
	ArrowDownRight,
	ArrowUpRight,
	BarChart3,
	BadgeDollarSign,
	PiggyBank,
	TriangleAlert,
} from "lucide-react";
import {
	Bar,
	BarChart,
	CartesianGrid,
	LabelList,
	ResponsiveContainer,
	XAxis,
	YAxis,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
	type ChartConfig,
} from "@/components/ui/chart";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	formatCurrency,
	formatPercent,
	formatRangeLabel,
	type FinanceDateRange,
	type FinanceRangePreset,
} from "@/features/finance/finance-dashboard-utils";
import { cn } from "@/lib/utils";

export interface FinanceSummaryCardData {
	label: string;
	metric: "income" | "expense" | "net";
	value: string;
	trendLabel: string;
	trendValue: number | null;
	currency: string;
}

export interface FinanceTrendPoint {
	label: string;
	income: number;
	expense: number;
	net: number;
}

export interface FinanceTrendSection {
	currency: string;
	rows: FinanceTrendPoint[];
}

export interface FinanceInsightRow {
	assetId?: string;
	label: string;
	subtitle: string;
	value: string;
	shareLabel: string;
	fill: number;
	trend: "positive" | "negative";
}

export interface FinanceAlertItem {
	tone: "info" | "warning";
	title: string;
	detail: string;
}

export interface FinancePeriodOption {
	key: string;
	label: string;
	selected: boolean;
	disabled?: boolean;
}

export interface FinancePeriodWheel {
	label: string;
	options: FinancePeriodOption[];
	onSelect: (key: string) => void;
}

interface FinanceDashboardShellProps {
	rangePreset: FinanceRangePreset;
	onPresetChange: (preset: FinanceRangePreset) => void;
	range: FinanceDateRange;
	onRangeChange: (nextRange: FinanceDateRange) => void;
	summaryCards: FinanceSummaryCardData[];
	chartSections: FinanceTrendSection[];
	profitabilityRows: FinanceInsightRow[];
	lossRows: FinanceInsightRow[];
	expenseRows: FinanceInsightRow[];
	incomeRows: FinanceInsightRow[];
	alerts: FinanceAlertItem[];
	isCustomRange: boolean;
	periodWheel?: FinancePeriodWheel;
	onInsightAssetClick?: (assetId: string) => void;
	headerActions?: React.ReactNode;
}

const RANGE_OPTIONS: Array<{ value: FinanceRangePreset; label: string }> = [
	{ value: "week", label: "Semana" },
	{ value: "month", label: "Mes" },
	{ value: "year", label: "Año" },
	{ value: "custom", label: "Personalizado" },
];

const SummaryTile = ({ card }: { card: FinanceSummaryCardData }) => {
	const positiveTrend = card.metric !== "expense";
	const trendIsPositive = card.trendValue !== null && card.trendValue >= 0;
	const directionIsUp =
		card.metric === "expense" ? !trendIsPositive : trendIsPositive;
	const TrendIcon = directionIsUp ? ArrowUpRight : ArrowDownRight;
	const MetricIcon =
		card.metric === "income"
			? ArrowUpRight
			: card.metric === "expense"
				? ArrowDownRight
				: PiggyBank;
	const trendTone =
		card.trendValue === null
			? "text-muted-foreground"
			: positiveTrend
				? directionIsUp
					? "text-success"
					: "text-destructive"
				: directionIsUp
					? "text-destructive"
					: "text-success";
	const labelTone =
		card.metric === "income"
			? "text-success"
			: card.metric === "expense"
				? "text-destructive"
				: "text-destructive";
	const tileTone =
		card.metric === "net"
			? "border-destructive/30 bg-destructive/10"
			: "border-transparent bg-muted/40";

	return (
		<div
			className={cn(
				"min-w-0 rounded-2xl border px-2.5 py-2.5 sm:px-3 sm:py-3",
				tileTone,
			)}
		>
			<div className="flex items-start justify-between gap-2">
				<div
					className={cn(
						"inline-flex min-w-0 items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.08em] sm:gap-1.5 sm:text-[11px] sm:tracking-[0.12em]",
						labelTone,
					)}
				>
					<MetricIcon className="size-3 shrink-0 sm:size-3.5" />
					<span className="truncate">{card.label}</span>
				</div>
				{card.trendValue === null ? (
					<span className="shrink-0 text-[10px] text-muted-foreground sm:text-[11px]">
						--
					</span>
				) : (
					<span
						className={cn(
							"inline-flex shrink-0 items-center gap-0.5 text-[10px] font-semibold sm:gap-1 sm:text-[11px]",
							trendTone,
						)}
					>
						<TrendIcon className="size-3" />
						{formatPercent(card.trendValue)}
					</span>
				)}
			</div>
			<p className="mt-2 overflow-hidden text-ellipsis whitespace-nowrap text-[0.95rem] leading-none font-semibold tracking-tight text-foreground sm:text-[1.1rem] lg:text-[1.35rem]">
				{card.value}
			</p>
		</div>
	);
};

const BalanceSummaryCard = ({ cards }: { cards: FinanceSummaryCardData[] }) => (
	<Card className="rounded-3xl border border-border/70 bg-card/90 shadow-sm">
		<CardHeader className="pb-2 sm:pb-3">
			<div className="flex items-center justify-between gap-3">
				<CardTitle className="text-sm font-semibold uppercase tracking-[0.14em] text-foreground sm:text-base">
					Resumen de balance
				</CardTitle>
				<p className="text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground sm:text-xs">
					Comparado al periodo anterior
				</p>
			</div>
		</CardHeader>
		<CardContent className="grid grid-cols-3 gap-2 pt-0">
			{cards.map((card) => (
				<SummaryTile
					key={card.label}
					card={card}
				/>
			))}
		</CardContent>
	</Card>
);

const MiniRows = ({
	rows,
	onAssetClick,
}: {
	rows: FinanceInsightRow[];
	onAssetClick?: (assetId: string) => void;
}) => {
	if (rows.length === 0) {
		return (
			<p className="text-sm text-muted-foreground">
				No hay datos para este periodo.
			</p>
		);
	}

	return (
		<div className="space-y-3">
			{rows.map((row) => {
				const isClickable = !!onAssetClick && !!row.assetId;
				return (
					<div
						key={`${row.label}-${row.value}`}
						className={cn(
							"space-y-1.5 rounded-lg",
							isClickable
								? "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
								: undefined,
						)}
						role={isClickable ? "button" : undefined}
						tabIndex={isClickable ? 0 : undefined}
						onClick={
							isClickable
								? () => {
										onAssetClick(row.assetId as string);
									}
								: undefined
						}
						onKeyDown={
							isClickable
								? (event) => {
										if (event.key !== "Enter" && event.key !== " ") return;
										event.preventDefault();
										onAssetClick(row.assetId as string);
									}
								: undefined
						}
					>
						<div className="flex items-center justify-between gap-3 text-sm">
							<div className="min-w-0">
								<p className="truncate font-medium">{row.label}</p>
								<p className="truncate text-xs text-muted-foreground">
									{row.subtitle}
								</p>
							</div>
							<div className="text-right">
								<p
									className={
										row.trend === "negative"
											? "font-semibold text-destructive"
											: "font-semibold text-success"
									}
								>
									{row.value}
								</p>
								<p className="text-xs text-muted-foreground">
									{row.shareLabel}
								</p>
							</div>
						</div>
						<div className="h-1.5 overflow-hidden rounded-full bg-muted">
							<div
								className={cn(
									"h-full rounded-full",
									row.trend === "negative" ? "bg-destructive" : "bg-success",
								)}
								style={{ width: `${Math.max(4, row.fill)}%` }}
							/>
						</div>
					</div>
				);
			})}
		</div>
	);
};

const RangeSelector = ({
	rangePreset,
	onPresetChange,
	range,
	onRangeChange,
	isCustomRange,
}: Pick<
	FinanceDashboardShellProps,
	"rangePreset" | "onPresetChange" | "range" | "onRangeChange" | "isCustomRange"
>) => (
	<div className="w-full space-y-3">
		<div className="grid w-full grid-cols-4 gap-2 rounded-2xl bg-muted/60 p-1.5">
			{RANGE_OPTIONS.map((option) => (
				<Button
					key={option.value}
					type="button"
					size="sm"
					variant={rangePreset === option.value ? "secondary" : "ghost"}
					className="h-8 rounded-xl px-2 text-xs"
					onClick={() => onPresetChange(option.value)}
				>
					{option.label}
				</Button>
			))}
		</div>

		{isCustomRange && (
			<div className="flex flex-wrap items-end gap-3">
				<div className="w-auto space-y-2">
					<Label className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
						Desde
					</Label>
					<Input
						type="date"
						className="w-[11.5rem] bg-card"
						value={range.from}
						onChange={(event) =>
							onRangeChange({ ...range, from: event.target.value })
						}
					/>
				</div>
				<div className="w-auto space-y-2">
					<Label className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
						Hasta
					</Label>
					<Input
						type="date"
						className="w-[11.5rem] bg-card"
						value={range.to}
						onChange={(event) =>
							onRangeChange({ ...range, to: event.target.value })
						}
					/>
				</div>
			</div>
		)}
	</div>
);

const PeriodWheel = ({ wheel }: { wheel: FinancePeriodWheel }) => {
	if (wheel.options.length === 0) return null;

	return (
		<div className="w-full space-y-2">
			<p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
				{wheel.label}
			</p>
			<div className="overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
				<div className="flex min-w-max items-center gap-2 snap-x snap-mandatory">
					{wheel.options.map((option) => (
						<Button
							key={option.key}
							type="button"
							size="sm"
							variant={option.selected ? "secondary" : "outline"}
							className="h-8 shrink-0 snap-center rounded-full px-3 text-xs"
							disabled={option.disabled}
							onClick={(event) => {
								wheel.onSelect(option.key);
								event.currentTarget.scrollIntoView({
									behavior: "smooth",
									inline: "center",
									block: "nearest",
								});
							}}
						>
							{option.label}
						</Button>
					))}
				</div>
			</div>
		</div>
	);
};

const cashflowChartConfig = {
	income: {
		label: "Ingresos",
		color: "var(--color-chart-1)",
	},
	expense: {
		label: "Gastos",
		color: "var(--color-chart-3)",
	},
	label: {
		color: "var(--background)",
	},
} satisfies ChartConfig;

const periodDayLabelFormatter = new Intl.DateTimeFormat("es-ES", {
	day: "2-digit",
	month: "short",
});

const periodMonthLabelFormatter = new Intl.DateTimeFormat("es-ES", {
	month: "short",
	year: "2-digit",
});

const formatTrendPeriodLabel = (value: string): string => {
	const trimmed = value.trim();
	if (!trimmed) return value;

	const monthMatch = trimmed.match(/^(\d{4})-(\d{2})$/);
	if (monthMatch) {
		const year = Number(monthMatch[1]);
		const monthIndex = Number(monthMatch[2]) - 1;
		if (monthIndex >= 0 && monthIndex <= 11) {
			return periodMonthLabelFormatter.format(new Date(year, monthIndex, 1));
		}
	}

	const parsedDate = new Date(trimmed);
	if (!Number.isNaN(parsedDate.getTime())) {
		return periodDayLabelFormatter.format(parsedDate);
	}

	return trimmed.length > 14 ? `${trimmed.slice(0, 14)}...` : trimmed;
};

const FinanceTrendChart = ({
	sections,
}: {
	sections: FinanceTrendSection[];
}) => {
	if (sections.length === 0) {
		return (
			<p className="text-sm text-muted-foreground">
				No hay datos de flujo de caja para este rango.
			</p>
		);
	}

	return (
		<div className="space-y-4">
			{sections.map((section) => {
				const chartData = section.rows.map((row) => ({
					period: formatTrendPeriodLabel(row.label),
					income: Math.max(0, row.income),
					expense: Math.max(0, row.expense),
					incomeLabel: formatCurrency(row.income, section.currency),
					expenseLabel: formatCurrency(row.expense, section.currency),
				}));
				const chartHeight = Math.max(240, chartData.length * 42);

				return (
					<div
						key={section.currency}
						className="space-y-3"
					>
						<div className="flex items-center justify-between gap-2">
							<Badge variant="outline">{section.currency}</Badge>
							<p className="text-xs text-muted-foreground">
								Ingresos vs gastos en el tiempo
							</p>
						</div>
						<div className="overflow-x-hidden">
							<ChartContainer
								config={cashflowChartConfig}
								className="w-full"
								style={{ height: `${chartHeight}px` }}
							>
								<ResponsiveContainer
									width="100%"
									height="100%"
								>
									<BarChart
										accessibilityLayer
										layout="vertical"
										data={chartData}
										barCategoryGap="28%"
										barGap={6}
										maxBarSize={10}
										margin={{ top: 8, right: 24, left: 8, bottom: 8 }}
									>
										<CartesianGrid horizontal={false} />
										<XAxis
											type="number"
											hide
										/>
										<YAxis
											dataKey="period"
											type="category"
											tickLine={false}
											axisLine={false}
											tickMargin={10}
											width={54}
										/>
										<ChartTooltip
											cursor={false}
											content={<ChartTooltipContent indicator="line" />}
										/>
										<Bar
											dataKey="income"
											name="income"
											fill="var(--color-income)"
											maxBarSize={10}
											radius={[0, 4, 4, 0]}
										>
											<LabelList
												dataKey="incomeLabel"
												position="right"
												offset={8}
												className="fill-foreground"
												fontSize={11}
											/>
										</Bar>
										<Bar
											dataKey="expense"
											name="expense"
											fill="var(--color-expense)"
											maxBarSize={10}
											radius={[0, 4, 4, 0]}
										>
											<LabelList
												dataKey="expenseLabel"
												position="right"
												offset={8}
												className="fill-muted-foreground"
												fontSize={11}
											/>
										</Bar>
									</BarChart>
								</ResponsiveContainer>
							</ChartContainer>
						</div>
					</div>
				);
			})}
		</div>
	);
};

export function FinanceDashboardShell({
	rangePreset,
	onPresetChange,
	range,
	onRangeChange,
	summaryCards,
	chartSections,
	profitabilityRows,
	lossRows,
	expenseRows,
	incomeRows,
	alerts,
	isCustomRange,
	periodWheel,
	onInsightAssetClick,
	headerActions,
}: FinanceDashboardShellProps) {
	return (
		<div className="space-y-4 pb-6">
			<section className="v2-card p-5 md:p-6">
				<div className="flex items-start justify-between gap-3">
					<div>
						<p className="v2-kicker">Finanzas</p>
						<h1 className="mt-2 text-2xl font-semibold tracking-tight">
							Finanzas
						</h1>
						<p className="mt-1 text-sm leading-6 text-muted-foreground">
							Vista rapida de ingresos, costos y balance neto de la granja.
						</p>
					</div>
					{headerActions ? (
						<div className="flex shrink-0 flex-wrap justify-end gap-2">
							{headerActions}
						</div>
					) : null}
				</div>
			</section>

			<section className="flex w-full flex-col items-center gap-2">
				<div className="w-full">
					<RangeSelector
						rangePreset={rangePreset}
						onPresetChange={onPresetChange}
						range={range}
						onRangeChange={onRangeChange}
						isCustomRange={isCustomRange}
					/>
				</div>
				{periodWheel ? (
					<PeriodWheel wheel={periodWheel} />
				) : !isCustomRange ? (
					<Badge
						variant="secondary"
						className="rounded-full"
					>
						{formatRangeLabel(range)}
					</Badge>
				) : null}
			</section>

			<section>
				<BalanceSummaryCard cards={summaryCards} />
			</section>

			<Card className="border-0 bg-card/90 shadow-sm">
				<CardHeader className="pb-3">
					<div className="flex items-center justify-between gap-3">
						<div>
							<CardTitle className="text-base font-semibold tracking-tight">
								Flujo de caja
							</CardTitle>
							<p className="mt-1 text-sm text-muted-foreground">
								Ingresos vs gastos en el periodo seleccionado.
							</p>
						</div>
						<BarChart3 className="size-4 text-muted-foreground" />
					</div>
				</CardHeader>
				<CardContent>
					<FinanceTrendChart sections={chartSections} />
				</CardContent>
			</Card>

			<Card className="border-0 bg-card/90 shadow-sm">
				<CardHeader className="pb-3">
					<CardTitle className="text-base font-semibold tracking-tight">
						Analisis financiero
					</CardTitle>
				</CardHeader>
				<CardContent>
					<Tabs
						defaultValue="profitability"
						className="space-y-4"
					>
						<TabsList className="grid w-full grid-cols-3">
							<TabsTrigger value="profitability">Rentabilidad</TabsTrigger>
							<TabsTrigger value="expenses">Gastos</TabsTrigger>
							<TabsTrigger value="income">Ingresos</TabsTrigger>
						</TabsList>

						<TabsContent
							value="profitability"
							className="space-y-4"
						>
							<p className="text-xs text-(--v2-ink-soft)">
								Neto operativo, sin el alimento consumido.
							</p>
							<div className="space-y-2">
								<div className="flex items-center justify-between gap-2">
									<p className="text-sm font-medium">Activos mas rentables</p>
									<Badge variant="secondary">Mejores 5</Badge>
								</div>
								<MiniRows
									rows={profitabilityRows}
									onAssetClick={onInsightAssetClick}
								/>
							</div>
							<Separator />
							<div className="space-y-2">
								<div className="flex items-center justify-between gap-2">
									<p className="text-sm font-medium">
										Activos operando con perdida
									</p>
									<Badge variant="warning">Atencion</Badge>
								</div>
								<MiniRows
									rows={lossRows}
									onAssetClick={onInsightAssetClick}
								/>
							</div>
						</TabsContent>

						<TabsContent
							value="expenses"
							className="space-y-4"
						>
							<div className="space-y-2">
								<p className="text-sm font-medium">
									Mayores contribuyentes de gasto
								</p>
								<MiniRows rows={expenseRows} />
							</div>
						</TabsContent>

						<TabsContent
							value="income"
							className="space-y-4"
						>
							<div className="space-y-2">
								<p className="text-sm font-medium">
									Mayores contribuyentes de ingreso
								</p>
								<MiniRows rows={incomeRows} />
							</div>
						</TabsContent>
					</Tabs>
				</CardContent>
			</Card>

			<Card className="border-0 bg-card/90 shadow-sm">
				<CardHeader className="pb-3">
					<CardTitle className="text-base font-semibold tracking-tight">
						Alertas y analisis
					</CardTitle>
				</CardHeader>
				<CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
					{alerts.map((alert) => (
						<div
							key={alert.title}
							className={cn(
								"rounded-2xl border p-4 text-sm",
								alert.tone === "warning"
									? "border-warning/20 bg-warning/5"
									: "border-info/20 bg-info/5",
							)}
						>
							<div className="flex items-start gap-3">
								{alert.tone === "warning" ? (
									<TriangleAlert className="mt-0.5 size-4 shrink-0 text-warning" />
								) : (
									<BadgeDollarSign className="mt-0.5 size-4 shrink-0 text-info" />
								)}
								<div className="space-y-1">
									<p className="font-medium">{alert.title}</p>
									<p className="text-muted-foreground">{alert.detail}</p>
								</div>
							</div>
						</div>
					))}
				</CardContent>
			</Card>
		</div>
	);
}
