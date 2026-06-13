import { useMemo } from "react";

import { useGetProductionReport } from "@/features/livestock/api/livestock-queries";
import { useListEventCategoriesByFarmId } from "@/features/livestock/api/livestock-queries";

import { FlockProductionSeriesSlider } from "./flock-production-series-slider";
import type { ProductionProductSeries } from "./flock-detail-types";
import { parseNumeric } from "./flock-detail-utils";

interface FlockProductionOverviewSectionProps {
	farmId: string;
	assetId: number;
}

export function FlockProductionOverviewSection({
	farmId,
	assetId,
}: FlockProductionOverviewSectionProps) {
	const sevenDaysAgo = useMemo(() => {
		const now = new Date();
		return new Date(
			now.getFullYear(),
			now.getMonth(),
			now.getDate() - 6,
		).toISOString();
	}, []);

	const { data: eventCategories = [] } = useListEventCategoriesByFarmId({
		farmId,
		filters: { archived: false, pageSize: 100 },
		enabled: !!farmId,
	});
	const { data: productionReport } = useGetProductionReport({
		farmId,
		filters: {
			assetId,
			bucket: "day",
			type: "production",
			dateFrom: sevenDaysAgo,
		},
		enabled: !!farmId,
	});

	const productionSeries = useMemo<ProductionProductSeries[]>(() => {
		const today = new Date();
		const days = Array.from({ length: 7 }, (_, index) => {
			const d = new Date(today);
			d.setHours(0, 0, 0, 0);
			d.setDate(today.getDate() - (6 - index));
			return d;
		});
		const dayLabels = days.map((day) =>
			day.toLocaleDateString("es-EC", { weekday: "short" }),
		);
		const dayKeys = days.map((d) => d.toISOString().slice(0, 10));
		const firstDayLabel = days[0]?.toLocaleDateString("es-EC", {
			weekday: "short",
		});
		const dayKeySet = new Set(dayKeys);
		const categoryNameById = new Map(
			eventCategories.map((category) => [category.id, category.name]),
		);
		type ProductAggregation = {
			productLabel: string;
			totalsByDay: Map<string, number>;
		};
		const totalsByProduct = new Map<string, ProductAggregation>();

		for (const row of productionReport?.data ?? []) {
			const key = row.bucket_start.slice(0, 10);
			if (!dayKeySet.has(key)) continue;

			const categoryKey =
				row.category_id != null ? String(row.category_id) : "uncategorized";
			const unitKey = row.unit ?? "unit";
			const productKey = `${unitKey}::${categoryKey}`;
			const categoryLabel =
				categoryKey === "uncategorized"
					? "Sin categoria"
					: (categoryNameById.get(Number(categoryKey)) ??
						`Categoria #${categoryKey}`);
			const productLabel =
				categoryKey === "uncategorized"
					? unitKey
					: `${unitKey} · ${categoryLabel}`;

			if (!totalsByProduct.has(productKey)) {
				totalsByProduct.set(productKey, {
					productLabel,
					totalsByDay: new Map(dayKeys.map((dayKey) => [dayKey, 0])),
				});
			}

			const product = totalsByProduct.get(productKey);
			if (!product) continue;
			product.totalsByDay.set(
				key,
				(product.totalsByDay.get(key) ?? 0) + parseNumeric(row.total),
			);
		}

		return Array.from(totalsByProduct.entries())
			.map(([productKey, { productLabel, totalsByDay }]) => {
				const series = dayKeys.map((dayKey) => totalsByDay.get(dayKey) ?? 0);
				const totalLast7Days = series.reduce((sum, value) => sum + value, 0);
				const todayCount = series[series.length - 1] ?? 0;
				return {
					productKey,
					productLabel,
					firstDayLabel: firstDayLabel ?? "",
					dayLabels,
					totalLast7Days,
					todayCount,
					series,
				};
			})
			.sort((left, right) => right.totalLast7Days - left.totalLast7Days);
	}, [productionReport, eventCategories]);

	if (productionSeries.length === 0) {
		return null;
	}

	return (
		<div className="grid gap-3">
			<FlockProductionSeriesSlider series={productionSeries} />
		</div>
	);
}
