import { useRef, useState } from "react";

import type {
	UnitDashboardSlice,
	UnitKpiCard,
} from "@/shared/types/v2-domain-types";

// ─── Sparkline ───────────────────────────────────────────────────────────────

function Sparkline({ data }: { data: number[] }) {
	if (data.length < 2) return null;

	const max = Math.max(...data, 1);
	const w = 72;
	const h = 24;
	const pad = 2;
	const points = data
		.map((v, i) => {
			const x = pad + (i / (data.length - 1)) * (w - pad * 2);
			const y = h - pad - (v / max) * (h - pad * 2);
			return `${x.toFixed(1)},${y.toFixed(1)}`;
		})
		.join(" ");

	return (
		<svg
			width={w}
			height={h}
			viewBox={`0 0 ${w} ${h}`}
			aria-hidden="true"
			className="mt-1 overflow-visible"
		>
			<polyline
				points={points}
				fill="none"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinejoin="round"
				strokeLinecap="round"
				className="text-[color:var(--v2-ink)]"
			/>
		</svg>
	);
}

// ─── Fill bar ─────────────────────────────────────────────────────────────────

const STATUS_COLOR: Record<string, string> = {
	ok: "bg-[color:var(--v2-primary)]",
	low: "bg-amber-400",
	critical: "bg-red-500",
};

function FillBar({ pct, status = "ok" }: { pct: number; status?: string }) {
	const clampedPct = Math.max(0, Math.min(pct, 1));
	const color = STATUS_COLOR[status] ?? STATUS_COLOR["ok"];
	return (
		<div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[color:var(--v2-border)]">
			<div
				className={`h-full rounded-full transition-[width] duration-500 ${color}`}
				style={{ width: `${(clampedPct * 100).toFixed(1)}%` }}
			/>
		</div>
	);
}

// ─── KpiCell ─────────────────────────────────────────────────────────────────

function KpiCell({ kpi }: { kpi: UnitKpiCard }) {
	return (
		<div className="flex flex-col justify-between p-3">
			<p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[color:var(--v2-ink-soft)]">
				{kpi.label}
			</p>
			<div className="mt-1">
				{kpi.sparkline ? (
					<>
						<p className="text-xl font-semibold leading-none">{kpi.value}</p>
						<Sparkline data={kpi.sparkline} />
					</>
				) : (
					<p className="text-xl font-semibold leading-none">{kpi.value}</p>
				)}
				{kpi.fillPct != null && (
					<FillBar
						pct={kpi.fillPct}
						status={kpi.status}
					/>
				)}
				{kpi.sub && (
					<p className="mt-1 text-[11px] text-[color:var(--v2-ink-soft)]">
						{kpi.sub}
					</p>
				)}
			</div>
		</div>
	);
}

// ─── UnitCard ─────────────────────────────────────────────────────────────────

const CATEGORY_ICON: Record<string, string> = {
	Chicken: "🐔",
	Sheep: "🐑",
	Goat: "🐐",
	Pig: "🐷",
	Cow: "🐄",
	Crop: "🌾",
};

const MODE_LABEL: Record<string, string> = {
	aggregate: "lote",
	individual: "individual",
};

function UnitCard({ slice }: { slice: UnitDashboardSlice }) {
	const icon = CATEGORY_ICON[slice.categoryLabel] ?? "🌿";

	return (
		<article className="v2-card flex w-full shrink-0 flex-col overflow-hidden">
			{/* Card header */}
			<div className="flex items-center gap-2 border-b border-[color:var(--v2-border)] px-4 py-3">
				<span
					className="text-lg"
					aria-hidden="true"
				>
					{icon}
				</span>
				<div className="min-w-0 flex-1">
					<p className="truncate font-semibold leading-tight">
						{slice.unitName}
					</p>
					<p className="text-[11px] text-[color:var(--v2-ink-soft)]">
						{slice.categoryLabel}
					</p>
				</div>
				<span className="rounded-full bg-[color:var(--v2-accent)]/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[color:var(--v2-ink)]">
					{MODE_LABEL[slice.mode] ?? slice.mode}
				</span>
			</div>

			{/* 2×2 KPI grid */}
			<div className="grid flex-1 grid-cols-2 divide-x divide-y divide-[color:var(--v2-border)]">
				{slice.kpis.map((kpi) => (
					<KpiCell
						key={kpi.label}
						kpi={kpi}
					/>
				))}
			</div>
		</article>
	);
}

// ─── UnitKpiSlider (exported) ─────────────────────────────────────────────────

interface UnitKpiSliderProps {
	slices: UnitDashboardSlice[];
}

export function UnitKpiSlider({ slices }: UnitKpiSliderProps) {
	const [activeIndex, setActiveIndex] = useState(0);
	const trackRef = useRef<HTMLDivElement>(null);

	function handleScroll() {
		const track = trackRef.current;
		if (!track) return;
		const idx = Math.round(track.scrollLeft / track.clientWidth);
		setActiveIndex(idx);
	}

	if (slices.length === 0) return null;

	return (
		<div className="space-y-2">
			{/* Scroll track */}
			<div
				ref={trackRef}
				onScroll={handleScroll}
				className="flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
			>
				{slices.map((slice) => (
					<div
						key={slice.unitId}
						className="w-full shrink-0 snap-center"
					>
						<UnitCard slice={slice} />
					</div>
				))}
			</div>

			{/* Dot indicators */}
			{slices.length > 1 && (
				<div
					className="flex justify-center gap-1.5"
					role="tablist"
					aria-label="Carrusel de unidades"
				>
					{slices.map((slice, i) => (
						<button
							key={slice.unitId}
							role="tab"
							aria-selected={i === activeIndex}
							aria-label={slice.unitName}
							onClick={() => {
								trackRef.current?.scrollTo({
									left: i * (trackRef.current.clientWidth + 12),
									behavior: "smooth",
								});
								setActiveIndex(i);
							}}
							className={`h-1.5 rounded-full transition-all duration-200 ${
								i === activeIndex
									? "w-5 bg-[color:var(--v2-ink)]"
									: "w-1.5 bg-[color:var(--v2-border)]"
							}`}
						/>
					))}
				</div>
			)}
		</div>
	);
}
