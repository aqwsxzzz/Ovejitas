import { useState } from "react";

import type { ProductionProductSeries } from "./flock-detail-types";

function Bars({ data, labels }: { data: number[]; labels?: string[] }) {
	const max = Math.max(...data, 1);
	const mid = Math.max(Math.round(max / 2), 1);
	const highlightedIndex = data.reduce(
		(bestIndex, value, index, list) =>
			value > (list[bestIndex] ?? Number.NEGATIVE_INFINITY) ? index : bestIndex,
		0,
	);
	const weekdayLabels =
		labels && labels.length === data.length
			? labels
			: Array.from({ length: data.length }, (_, index) => {
					const d = new Date();
					d.setHours(0, 0, 0, 0);
					d.setDate(d.getDate() - (data.length - 1 - index));
					return d.toLocaleDateString("es-EC", { weekday: "short" });
				});

	return (
		<div className="mt-3 rounded-xl border border-white/45 bg-[#cfd2d6] p-3">
			<div className="relative h-28">
				<div className="pointer-events-none absolute inset-x-0 top-4 border-t border-white/40" />
				<div className="pointer-events-none absolute inset-x-0 top-14 border-t border-white/40" />
				<div className="pointer-events-none absolute inset-x-0 top-24 border-t border-white/40" />
				<div className="pointer-events-none absolute right-0 top-0 flex h-24 w-8 flex-col justify-between text-right text-[9px] font-medium text-[#6c798f]">
					<span>{max}</span>
					<span>{mid}</span>
					<span>0</span>
				</div>
				<div className="absolute bottom-0 left-3 right-9 grid h-24 grid-cols-7 gap-3">
					{data.map((value, index) => {
						const barHeightPct =
							value <= 0 ? 2 : Math.max((value / max) * 100, 14);
						return (
							<div
								key={`${value}-${index}`}
								className="flex items-end justify-center"
							>
								<div
									className={`h-full w-full rounded-md ${
										value <= 0
											? "bg-[#efd97b]/35"
											: index === highlightedIndex
												? "bg-[#f5a000]"
												: "bg-[#efd97b]"
									}`}
									style={{ height: `${barHeightPct}%` }}
								/>
							</div>
						);
					})}
				</div>
			</div>
			<div className="mt-2 grid grid-cols-7 gap-3 pl-3 pr-9 text-center text-[10px] font-medium text-[#6c798f]">
				{weekdayLabels.map((label, index) => (
					<span key={`${label}-${index}`}>{label}</span>
				))}
			</div>
		</div>
	);
}

function ProductionSeriesCard({
	productSeries,
}: {
	productSeries: ProductionProductSeries;
}) {
	return (
		<div className="rounded-2xl border border-(--v2-border) bg-[#d7d9dd] p-4 shadow-[0_10px_24px_-18px_rgba(24,33,49,0.35)]">
			<p className="text-[10px] uppercase tracking-[0.08em] text-[#6c798f]">
				{productSeries.productLabel} · ultimos 7 dias
			</p>
			<div className="mt-2 flex items-start justify-between gap-3">
				<p className="text-5xl font-semibold leading-none text-[#243246]">
					{productSeries.totalLast7Days}
				</p>
				<div className="text-right text-sm text-[#6c798f]">
					<p className="text-xs uppercase tracking-[0.08em]">Hoy</p>
					<p className="text-xl font-semibold leading-none text-[#243246]">
						{productSeries.todayCount}
					</p>
				</div>
			</div>
			<Bars
				data={
					productSeries.series.length > 0
						? productSeries.series
						: [0, 0, 0, 0, 0, 0, 0]
				}
				labels={productSeries.dayLabels}
			/>
			<div className="mt-2 flex items-center justify-between text-[11px] uppercase tracking-[0.08em] text-[#6c798f]">
				<span>{productSeries.firstDayLabel}</span>
				<span>Hoy · {productSeries.todayCount}</span>
			</div>
		</div>
	);
}

interface FlockProductionSeriesSliderProps {
	series: ProductionProductSeries[];
}

export function FlockProductionSeriesSlider({
	series,
}: FlockProductionSeriesSliderProps) {
	const [activeIndex, setActiveIndex] = useState(0);

	if (series.length === 1) {
		return <ProductionSeriesCard productSeries={series[0]!} />;
	}

	return (
		<div className="space-y-2">
			<div
				className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1"
				onScroll={(event) => {
					const el = event.currentTarget;
					if (!el.clientWidth) return;
					const nextIndex = Math.round(el.scrollLeft / el.clientWidth);
					setActiveIndex(Math.max(0, Math.min(nextIndex, series.length - 1)));
				}}
			>
				{series.map((productSeries) => (
					<div
						key={productSeries.productKey}
						className="min-w-full snap-start"
					>
						<ProductionSeriesCard productSeries={productSeries} />
					</div>
				))}
			</div>
			<div className="flex items-center justify-center gap-1">
				{series.map((productSeries, index) => (
					<button
						key={productSeries.productKey}
						type="button"
						aria-label={`Ver serie ${index + 1}`}
						onClick={(event) => {
							const container = event.currentTarget
								.closest(".space-y-2")
								?.querySelector<HTMLDivElement>(".snap-x.snap-mandatory");
							if (!container) return;
							container.scrollTo({
								left: index * container.clientWidth,
								behavior: "smooth",
							});
							setActiveIndex(index);
						}}
						className={`h-2 w-2 rounded-full transition ${
							index === activeIndex ? "bg-(--v2-ink)" : "bg-black/30"
						}`}
					/>
				))}
			</div>
		</div>
	);
}
