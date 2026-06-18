import { Badge } from "@/components/ui/badge";
import { ErrorState } from "@/components/common/error-state";
import { EmptyState } from "@/components/common/empty-state";
import { LoadingState } from "@/components/common/loading-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FinanceTrendChart } from "@/features/finance/components/finance-trend-chart";
import type { FinanceFilters } from "@/features/finance/finance-types";
import {
	formatAssetKind,
	formatCurrency,
	formatDateLabel,
	parseDecimal,
	toApiDateTime,
} from "@/features/finance/finance-utils";
import {
	useGetAggregateReport,
	useGetInventorySummaryReport,
	useGetMaterialConsumptionAggregateReport,
	useGetProfitabilityReport,
} from "@/features/reports/api/reports-queries";
import type { ILivestockAsset } from "@/features/livestock/types/livestock-types";
import { ApiRequestError } from "@/lib/axios/axios-helper";

interface FinanceOverviewProps {
	farmId: string;
	filters: FinanceFilters;
	assets: ILivestockAsset[];
}

const matchesKind = (
	assetId: number,
	assetKind: FinanceFilters["assetKind"],
	assetsById: Map<number, ILivestockAsset>,
) => assetKind === "all" || assetsById.get(assetId)?.kind === assetKind;

export const FinanceOverview = ({
	farmId,
	filters,
	assets,
}: FinanceOverviewProps) => {
	const dateFrom = toApiDateTime(filters.dateFrom, false);
	const dateTo = toApiDateTime(filters.dateTo, true);
	const assetsById = new Map(assets.map((asset) => [asset.id, asset]));
	const selectedAsset = filters.assetId
		? assetsById.get(filters.assetId)
		: undefined;
	const blocksDetailedAggregates =
		filters.assetKind !== "all" && !filters.assetId;

	const profitabilityQuery = useGetProfitabilityReport({
		farmId,
		date_from: dateFrom,
		date_to: dateTo,
		asset_id: filters.assetId,
	});
	const incomeQuery = useGetAggregateReport(
		{
			farmId,
			bucket: filters.bucket,
			type: "income",
			date_from: dateFrom,
			date_to: dateTo,
			asset_id: filters.assetId,
		},
		!blocksDetailedAggregates,
	);
	const expenseQuery = useGetAggregateReport(
		{
			farmId,
			bucket: filters.bucket,
			type: "expense",
			date_from: dateFrom,
			date_to: dateTo,
			asset_id: filters.assetId,
		},
		!blocksDetailedAggregates,
	);
	const inventoryQuery = useGetInventorySummaryReport({
		farmId,
		date_to: dateTo,
		asset_id: filters.assetId,
	});
	const materialQuery = useGetMaterialConsumptionAggregateReport(
		{
			farmId,
			bucket: filters.bucket,
			group_by: "material",
			material_asset_id:
				selectedAsset?.kind === "material" ? selectedAsset.id : undefined,
			consumer_asset_id:
				selectedAsset && selectedAsset.kind !== "material"
					? selectedAsset.id
					: undefined,
			reason:
				filters.materialReason === "all" ? undefined : filters.materialReason,
			date_from: dateFrom,
			date_to: dateTo,
		},
		!blocksDetailedAggregates,
	);

	const profitabilityError =
		profitabilityQuery.error instanceof ApiRequestError
			? profitabilityQuery.error.message
			: undefined;
	const aggregateError =
		incomeQuery.error instanceof ApiRequestError
			? incomeQuery.error.message
			: expenseQuery.error instanceof ApiRequestError
				? expenseQuery.error.message
				: undefined;
	const materialError =
		materialQuery.error instanceof ApiRequestError
			? materialQuery.error.message
			: undefined;

	const profitabilityRows = (profitabilityQuery.data?.data ?? []).filter(
		(row) => matchesKind(row.asset_id, filters.assetKind, assetsById),
	);
	const summaryByCurrency = Object.values(
		profitabilityRows.reduce(
			(acc, row) => {
				const current = acc[row.currency] ?? {
					currency: row.currency,
					income: 0,
					expense: 0,
					net: 0,
				};
				current.income += parseDecimal(row.income_total);
				current.expense += parseDecimal(row.expense_total);
				current.net += parseDecimal(row.net);
				acc[row.currency] = current;
				return acc;
			},
			{} as Record<
				string,
				{ currency: string; income: number; expense: number; net: number }
			>,
		),
	);
	const rankingRows = [...profitabilityRows].sort(
		(left, right) => parseDecimal(right.net) - parseDecimal(left.net),
	);
	const trendMap = new Map<
		string,
		Map<string, { income: number; expense: number }>
	>();
	for (const row of incomeQuery.data?.data ?? []) {
		const currency = row.group_label ?? row.group ?? "N/A";
		const rows = trendMap.get(currency) ?? new Map();
		const current = rows.get(row.bucket) ?? { income: 0, expense: 0 };
		current.income += parseDecimal(row.value);
		rows.set(row.bucket, current);
		trendMap.set(currency, rows);
	}
	for (const row of expenseQuery.data?.data ?? []) {
		const currency = row.group_label ?? row.group ?? "N/A";
		const rows = trendMap.get(currency) ?? new Map();
		const current = rows.get(row.bucket) ?? { income: 0, expense: 0 };
		current.expense += parseDecimal(row.value);
		rows.set(row.bucket, current);
		trendMap.set(currency, rows);
	}
	const trendSections = Array.from(trendMap.entries()).map(
		([currency, rows]) => ({
			currency,
			rows: Array.from(rows.entries())
				.sort(([left], [right]) => left.localeCompare(right))
				.map(([bucket, values]) => ({
					label: formatDateLabel(bucket),
					income: values.income,
					expense: values.expense,
					net: values.income - values.expense,
				})),
		}),
	);
	const inventoryRows = (inventoryQuery.data?.data ?? []).filter((row) =>
		matchesKind(row.asset_id, filters.assetKind, assetsById),
	);
	const materialRows = [...(materialQuery.data?.totals ?? [])]
		.sort(
			(left, right) =>
				parseDecimal(right.total_qty) - parseDecimal(left.total_qty),
		)
		.slice(0, 5);

	return (
		<div className="space-y-4">
			<section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
				{profitabilityQuery.isPending ? (
					<Card className="v2-card lg:col-span-3">
						<CardContent className="pt-6">
							<LoadingState message="Cargando resumen financiero..." />
						</CardContent>
					</Card>
				) : profitabilityError ? (
					<Card className="v2-card lg:col-span-3">
						<CardContent className="pt-6 text-sm text-destructive">
							{profitabilityError}
						</CardContent>
					</Card>
				) : summaryByCurrency.length === 0 ? (
					<Card className="v2-card lg:col-span-3">
						<CardContent className="pt-6 text-sm text-muted-foreground">
							No hay datos de rentabilidad para los filtros aplicados.
						</CardContent>
					</Card>
				) : (
					summaryByCurrency.map((summary) => (
						<Card
							key={summary.currency}
							className="v2-card"
						>
							<CardHeader>
								<CardTitle className="flex items-center justify-between text-lg">
									<span>Totales</span>
									<Badge variant="outline">{summary.currency}</Badge>
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-3 text-sm">
								<div>
									<p className="text-muted-foreground">Ingresos</p>
									<p className="text-xl font-semibold text-success">
										{formatCurrency(summary.income, summary.currency)}
									</p>
								</div>
								<div>
									<p className="text-muted-foreground">Gastos</p>
									<p className="text-xl font-semibold text-destructive">
										{formatCurrency(summary.expense, summary.currency)}
									</p>
								</div>
								<div>
									<p className="text-muted-foreground">Neto</p>
									<p
										className={
											summary.net >= 0
												? "text-xl font-semibold text-success"
												: "text-xl font-semibold text-destructive"
										}
									>
										{formatCurrency(summary.net, summary.currency)}
									</p>
								</div>
							</CardContent>
						</Card>
					))
				)}
			</section>

			<FinanceTrendChart
				sections={trendSections}
				isPending={incomeQuery.isPending || expenseQuery.isPending}
				errorMessage={aggregateError}
				blockedMessage={
					blocksDetailedAggregates
						? `La tendencia por tipo de activo aun no existe en backend. Selecciona un activo especifico de ${formatAssetKind(filters.assetKind).toLowerCase()} o quita el filtro.`
						: undefined
				}
			/>

			<section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
				<Card className="v2-card">
					<CardHeader>
						<CardTitle className="text-lg">Activos con mejor neto</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3">
						{rankingRows.length === 0 ? (
							<EmptyState title="Sin ranking para mostrar" />
						) : (
							rankingRows.slice(0, 6).map((row) => (
								<div
									key={`${row.asset_id}-${row.currency}`}
									className="flex items-center justify-between rounded-lg border px-3 py-2"
								>
									<div className="min-w-0">
										<p className="truncate font-medium">{row.asset_name}</p>
										<p className="text-xs text-muted-foreground">
											{formatAssetKind(
												assetsById.get(row.asset_id)?.kind ?? "all",
											)}
										</p>
									</div>
									<div className="text-right">
										<p
											className={
												parseDecimal(row.net) >= 0
													? "font-semibold text-success"
													: "font-semibold text-destructive"
											}
										>
											{formatCurrency(parseDecimal(row.net), row.currency)}
										</p>
										<p className="text-xs text-muted-foreground">
											{row.currency}
										</p>
									</div>
								</div>
							))
						)}
					</CardContent>
				</Card>

				<Card className="v2-card">
					<CardHeader>
						<CardTitle className="text-lg">Inventario relacionado</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3">
						{inventoryQuery.isPending ? (
							<LoadingState message="Cargando inventario..." />
						) : inventoryRows.length === 0 ? (
							<EmptyState title="No hay inventario para esta seleccion" />
						) : (
							inventoryRows.slice(0, 6).map((row) => (
								<div
									key={`${row.asset_id}-${row.unit}`}
									className="flex items-center justify-between rounded-lg border px-3 py-2"
								>
									<div>
										<p className="font-medium">{row.asset_name}</p>
										<p className="text-xs text-muted-foreground">
											{assetsById.get(row.asset_id)?.kind ?? "asset"}
										</p>
									</div>
									<p className="font-semibold">
										{parseDecimal(row.on_hand).toFixed(2)} {row.unit}
									</p>
								</div>
							))
						)}
					</CardContent>
				</Card>
			</section>

			<Card className="v2-card">
				<CardHeader>
					<CardTitle className="text-lg">Consumo material</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3">
					{blocksDetailedAggregates ? (
						<p className="text-sm text-muted-foreground">
							Este bloque necesita un activo especifico cuando filtras por tipo.
						</p>
					) : materialQuery.isPending ? (
						<LoadingState message="Cargando consumo..." />
					) : materialError ? (
						<ErrorState description={materialError} />
					) : materialRows.length === 0 ? (
						<EmptyState title="No hay consumo material para el rango actual" />
					) : (
						materialRows.map((row) => (
							<div
								key={`${row.group}-${row.unit}`}
								className="rounded-lg border px-3 py-3"
							>
								<div className="mb-2 flex items-center justify-between gap-3">
									<p className="font-medium">
										{row.group_label ?? "Sin grupo"}
									</p>
									<p className="text-sm font-semibold">
										{parseDecimal(row.total_qty).toFixed(2)} {row.unit}
									</p>
								</div>
								<p className="text-xs text-muted-foreground">
									Periodo {filters.bucket} · {filters.dateFrom} a{" "}
									{filters.dateTo}
								</p>
							</div>
						))
					)}
				</CardContent>
			</Card>
		</div>
	);
};
