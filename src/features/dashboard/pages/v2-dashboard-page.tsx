import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";

import { useGetUserProfile } from "@/features/auth/api/auth-queries";
import {
	listEventsByAssetId,
	listIndividualsByAssetId,
} from "@/features/livestock/api/livestock-api";
import {
	useGetCostPerUnitReport,
	useGetProductionReport,
	useGetProfitabilityReport,
	useListEventCategoriesByFarmId,
	useListLivestockAssetsByFarmId,
} from "@/features/livestock/api/livestock-queries";
import type {
	UnitDashboardSlice,
	UnitKpiSlide,
} from "@/shared/types/v2-domain-types";

import { UnitKpiSlider } from "../components/unit-kpi-slider";

const MONTH_LABEL = new Date().toLocaleDateString("es-EC", {
	month: "long",
	year: "numeric",
});

function parseNumeric(value: string | null | undefined): number {
	if (!value) return 0;
	const parsed = Number(value);
	return Number.isFinite(parsed) ? parsed : 0;
}

function formatMoneyCompact(value: number): string {
	if (Math.abs(value) >= 1000) {
		return `$${(value / 1000).toFixed(1)}k`;
	}
	return `$${value.toFixed(2)}`;
}

async function sumEventQuantityByType({
	farmId,
	assetId,
	type,
}: {
	farmId: string;
	assetId: number;
	type: "acquisition" | "mortality";
}): Promise<number> {
	let page = 1;
	const pageSize = 100;
	let total = 0;

	while (true) {
		const eventsResponse = await listEventsByAssetId({
			farmId,
			assetId: String(assetId),
			filters: {
				type,
				page,
				pageSize,
			},
		});

		for (const event of eventsResponse.data) {
			total += Number(event.quantity ?? 0) || 0;
		}

		if (!eventsResponse.meta.has_next) {
			break;
		}

		page = eventsResponse.meta.page + 1;
	}

	return total;
}

interface ProductionUnitData {
	/** Human-readable label for the slide (e.g. "kg" or "kg · 3") */
	label: string;
	/** Raw unit string (e.g. "kg") */
	unit: string;
	/** category_id from the production row, null when not set */
	categoryId: number | null;
	total: number;
	sparkline: number[];
}

function mapAssetToSlice(
	asset: {
		id: number;
		name: string;
		kind: string;
		mode: "aggregated" | "individual";
	},
	context: {
		aggregatedAnimalsByAssetId: Map<number, number>;
		productionByAssetAndUnit: Map<number, Map<string, ProductionUnitData>>;
		netByAssetId: Map<number, number>;
		costPerUnitByAssetId: Map<number, number>;
		currencyByAssetId: Map<number, string>;
		individualCountByAssetId: Map<number, number>;
		categoryNameById: Map<number, string>;
	},
): UnitDashboardSlice {
	const netValue = context.netByAssetId.get(asset.id) ?? 0;
	const costPerUnitValue = context.costPerUnitByAssetId.get(asset.id);
	const currency = context.currencyByAssetId.get(asset.id) ?? "USD";

	const animalsValue =
		asset.mode === "individual"
			? context.individualCountByAssetId.get(asset.id)
			: context.aggregatedAnimalsByAssetId.get(asset.id);
	const animalsDisplayValue =
		asset.mode === "aggregated"
			? String(animalsValue ?? 0)
			: typeof animalsValue === "number"
				? String(animalsValue)
				: "Sin dato";

	const unitDataMap =
		context.productionByAssetAndUnit.get(asset.id) ?? new Map();
	const productionSlides: UnitKpiSlide[] = Array.from(unitDataMap.values()).map(
		(data) => ({
			unit:
				data.categoryId != null
					? `${data.unit} · ${
							context.categoryNameById.get(data.categoryId) ??
							String(data.categoryId)
						}`
					: data.unit,
			value: data.total > 0 ? data.total.toFixed(0) : "0",
			sparkline: data.sparkline.length > 1 ? data.sparkline : undefined,
		}),
	);

	return {
		unitId: String(asset.id),
		unitName: asset.name,
		categoryLabel: asset.kind,
		mode: asset.mode === "aggregated" ? "aggregate" : "individual",
		status: "active",
		kpis: [
			{
				label: "Animales",
				value: animalsDisplayValue,
				sub:
					asset.mode === "individual"
						? "Individuos activos en la unidad"
						: "Adquisiciones - mortalidad",
			},
			{
				label: "Produccion",
				value:
					productionSlides.length > 0 ? productionSlides[0]!.value : "Sin dato",
				sub: "Ultimos 7 dias",
				slides: productionSlides.length > 0 ? productionSlides : undefined,
			},
			{
				label: "Neto",
				value: formatMoneyCompact(netValue),
				sub: "Mes actual",
			},
			{
				label: "Alimento",
				value:
					typeof costPerUnitValue === "number"
						? `${formatMoneyCompact(costPerUnitValue)}/u`
						: "Sin dato",
				sub: `Costo por unidad (${currency})`,
			},
		],
	};
}

export function V2DashboardPage() {
	const { data: currentUser } = useGetUserProfile();
	const farmId = currentUser?.lastVisitedFarmId ?? "";
	const now = useMemo(() => new Date(), []);
	const currentMonthStart = useMemo(
		() => new Date(now.getFullYear(), now.getMonth(), 1).toISOString(),
		[now],
	);
	const sevenDaysAgo = useMemo(
		() =>
			new Date(
				now.getFullYear(),
				now.getMonth(),
				now.getDate() - 6,
			).toISOString(),
		[now],
	);

	const { data: farmAssetsResponse, isLoading } =
		useListLivestockAssetsByFarmId({
			farmId,
			filters: { kind: "animal", page: 1, pageSize: 20 },
			enabled: !!farmId,
		});

	const assets = farmAssetsResponse?.data ?? [];

	const { data: profitabilityReport } = useGetProfitabilityReport({
		farmId,
		filters: { dateFrom: currentMonthStart },
		enabled: !!farmId,
	});

	const { data: productionReport } = useGetProductionReport({
		farmId,
		filters: {
			type: "production",
			bucket: "day",
			dateFrom: sevenDaysAgo,
		},
		enabled: !!farmId,
	});

	const { data: costPerUnitReport } = useGetCostPerUnitReport({
		farmId,
		filters: {
			unit: "head",
			dateFrom: currentMonthStart,
		},
		enabled: !!farmId,
	});

	const { data: eventCategories = [] } = useListEventCategoriesByFarmId({
		farmId,
		enabled: !!farmId,
	});

	const individualAssets = useMemo(
		() => assets.filter((asset) => asset.mode === "individual"),
		[assets],
	);

	const individualCountQueries = useQueries({
		queries: individualAssets.map((asset) => ({
			queryKey: ["livestock", "dashboard", "individualCount", farmId, asset.id],
			queryFn: () =>
				listIndividualsByAssetId({
					farmId,
					assetId: String(asset.id),
					filters: { page: 1, pageSize: 1 },
				}),
			enabled: !!farmId,
		})),
	});

	const individualCountByAssetId = useMemo(() => {
		const byAssetId = new Map<number, number>();
		individualAssets.forEach((asset, index) => {
			const total = individualCountQueries[index]?.data?.meta?.total;
			if (typeof total === "number") {
				byAssetId.set(asset.id, total);
			}
		});
		return byAssetId;
	}, [individualAssets, individualCountQueries]);

	const aggregatedAssets = useMemo(
		() => assets.filter((asset) => asset.mode === "aggregated"),
		[assets],
	);

	const aggregatedCountQueries = useQueries({
		queries: aggregatedAssets.map((asset) => ({
			queryKey: [
				"livestock",
				"dashboard",
				"aggregatedHeadcount",
				farmId,
				asset.id,
			],
			queryFn: async () => {
				const [acquisitions, mortalities] = await Promise.all([
					sumEventQuantityByType({
						farmId,
						assetId: asset.id,
						type: "acquisition",
					}),
					sumEventQuantityByType({
						farmId,
						assetId: asset.id,
						type: "mortality",
					}),
				]);

				return Math.max(acquisitions - mortalities, 0);
			},
			enabled: !!farmId,
		})),
	});

	const netByAssetId = useMemo(() => {
		const byAssetId = new Map<number, number>();
		for (const row of profitabilityReport?.data ?? []) {
			byAssetId.set(row.asset_id, parseNumeric(row.net));
		}
		return byAssetId;
	}, [profitabilityReport]);

	const aggregatedAnimalsByAssetId = useMemo(() => {
		const byAssetId = new Map<number, number>();
		aggregatedAssets.forEach((asset, index) => {
			const value = aggregatedCountQueries[index]?.data;
			if (typeof value === "number") {
				byAssetId.set(asset.id, value);
			}
		});

		return byAssetId;
	}, [aggregatedAssets, aggregatedCountQueries]);

	const productionByAssetAndUnit = useMemo(() => {
		const dayKeys = Array.from({ length: 7 }, (_, index) => {
			const day = new Date(now);
			day.setDate(day.getDate() - (6 - index));
			return day.toISOString().slice(0, 10);
		});

		// Intermediate: Map<assetId, Map<compositeKey, { unit, categoryId, byDay }>>
		// compositeKey = "unit::categoryId" to separate same-unit different-category products
		type Intermediate = Map<
			number,
			Map<
				string,
				{ unit: string; categoryId: number | null; byDay: Map<string, number> }
			>
		>;
		const assetUnitDayTotals: Intermediate = new Map();

		for (const row of productionReport?.data ?? []) {
			const dayKey = row.bucket_start.slice(0, 10);
			if (!dayKeys.includes(dayKey)) continue;

			const unit = row.unit ?? "unit";
			const catId = row.category_id;
			const compositeKey = `${unit}::${catId ?? ""}`;

			if (!assetUnitDayTotals.has(row.asset_id)) {
				assetUnitDayTotals.set(row.asset_id, new Map());
			}
			const byComposite = assetUnitDayTotals.get(row.asset_id)!;

			if (!byComposite.has(compositeKey)) {
				byComposite.set(compositeKey, {
					unit,
					categoryId: catId,
					byDay: new Map(dayKeys.map((k) => [k, 0])),
				});
			}
			const entry = byComposite.get(compositeKey)!;

			entry.byDay.set(
				dayKey,
				(entry.byDay.get(dayKey) ?? 0) + parseNumeric(row.total),
			);
		}

		const result = new Map<number, Map<string, ProductionUnitData>>();
		for (const [assetId, byComposite] of assetUnitDayTotals.entries()) {
			const unitMap = new Map<string, ProductionUnitData>();
			for (const [
				compositeKey,
				{ unit, categoryId, byDay },
			] of byComposite.entries()) {
				const sparkline = dayKeys.map((k) => byDay.get(k) ?? 0);
				const total = sparkline.reduce((sum, v) => sum + v, 0);
				unitMap.set(compositeKey, {
					label: unit,
					unit,
					categoryId,
					total,
					sparkline,
				});
			}
			result.set(assetId, unitMap);
		}
		return result;
	}, [productionReport, now]);

	const categoryNameById = useMemo(
		() => new Map(eventCategories.map((c) => [c.id, c.name])),
		[eventCategories],
	);

	const costPerUnitByAssetId = useMemo(() => {
		const byAssetId = new Map<number, number>();
		for (const row of costPerUnitReport?.data ?? []) {
			byAssetId.set(row.asset_id, parseNumeric(row.cost_per_unit));
		}
		return byAssetId;
	}, [costPerUnitReport]);

	const currencyByAssetId = useMemo(() => {
		const byAssetId = new Map<number, string>();
		for (const row of costPerUnitReport?.data ?? []) {
			if (row.currency) {
				byAssetId.set(row.asset_id, row.currency);
			}
		}
		return byAssetId;
	}, [costPerUnitReport]);

	const slices = useMemo(
		() =>
			assets.map((asset) =>
				mapAssetToSlice(asset, {
					aggregatedAnimalsByAssetId,
					productionByAssetAndUnit,
					netByAssetId,
					costPerUnitByAssetId,
					currencyByAssetId,
					individualCountByAssetId,
					categoryNameById,
				}),
			),
		[
			assets,
			aggregatedAnimalsByAssetId,
			productionByAssetAndUnit,
			netByAssetId,
			costPerUnitByAssetId,
			currencyByAssetId,
			individualCountByAssetId,
			categoryNameById,
		],
	);

	return (
		<section className="space-y-4">
			<div>
				<p className="v2-kicker">{MONTH_LABEL}</p>
				<h1 className="mt-1 text-2xl font-semibold">Dashboard</h1>
			</div>

			{!farmId ? (
				<article className="v2-card p-4">
					<p className="text-sm text-[color:var(--v2-ink-soft)]">
						Selecciona una granja para cargar datos reales del dashboard.
					</p>
				</article>
			) : isLoading ? (
				<article className="v2-card p-4">
					<p className="text-sm text-[color:var(--v2-ink-soft)]">
						Cargando unidades reales...
					</p>
				</article>
			) : slices.length === 0 ? (
				<article className="v2-card p-4">
					<p className="text-sm text-[color:var(--v2-ink-soft)]">
						No hay unidades de produccion reales para mostrar.
					</p>
				</article>
			) : (
				<UnitKpiSlider slices={slices} />
			)}

			<article className="v2-card p-4">
				<p className="v2-kicker mb-3">Alertas urgentes</p>
				<p className="text-sm text-[color:var(--v2-ink-soft)]">
					Las alertas se mostraran cuando el backend de reportes este disponible
					para este modulo.
				</p>
			</article>

			<article className="v2-card p-4">
				<p className="v2-kicker mb-3">Tareas de hoy</p>
				<p className="text-sm text-[color:var(--v2-ink-soft)]">
					No hay tareas con datos reales disponibles en esta vista.
				</p>
			</article>
		</section>
	);
}
