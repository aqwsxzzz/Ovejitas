import { useRef, useState } from "react";

import { useNavigate } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import type {
	UnitDashboardSlice,
	UnitKpiCard,
	UnitKpiSlide,
} from "@/shared/types/v2-domain-types";

// ─── Sparkline ───────────────────────────────────────────────────────────────

function buildSmoothPath(pts: Array<{ x: number; y: number }>): string {
	if (pts.length < 2) return "";
	let d = `M ${pts[0]!.x.toFixed(1)} ${pts[0]!.y.toFixed(1)}`;
	for (let i = 1; i < pts.length; i++) {
		const prev = pts[i - 1]!;
		const curr = pts[i]!;
		const cpx = ((prev.x + curr.x) / 2).toFixed(1);
		d += ` C ${cpx} ${prev.y.toFixed(1)}, ${cpx} ${curr.y.toFixed(1)}, ${curr.x.toFixed(1)} ${curr.y.toFixed(1)}`;
	}
	return d;
}

let sparklineIdCounter = 0;

function Sparkline({ data, full = false }: { data: number[]; full?: boolean }) {
	if (data.length < 2) return null;

	const id = `sparkline-grad-${++sparklineIdCounter}`;
	const min = Math.min(...data);
	const max = Math.max(...data, min + 1);
	const w = 100;
	const h = full ? 48 : 24;
	const padX = 0;
	const padY = full ? 6 : 3;

	const pts = data.map((v, i) => ({
		x: padX + (i / (data.length - 1)) * (w - padX * 2),
		y: h - padY - ((v - min) / (max - min)) * (h - padY * 2),
	}));

	const linePath = buildSmoothPath(pts);
	const first = pts[0]!;
	const last = pts[pts.length - 1]!;
	const areaPath = `${linePath} L ${last.x.toFixed(1)} ${h} L ${first.x.toFixed(1)} ${h} Z`;

	return (
		<svg
			width="100%"
			height={h}
			viewBox={`0 0 ${w} ${h}`}
			preserveAspectRatio="none"
			aria-hidden="true"
			className="overflow-visible"
		>
			<defs>
				<linearGradient
					id={id}
					x1="0"
					y1="0"
					x2="0"
					y2="1"
				>
					<stop
						offset="0%"
						stopColor="var(--v2-primary)"
						stopOpacity="0.35"
					/>
					<stop
						offset="100%"
						stopColor="var(--v2-primary)"
						stopOpacity="0"
					/>
				</linearGradient>
			</defs>
			<path
				d={areaPath}
				fill={`url(#${id})`}
			/>
			<path
				d={linePath}
				fill="none"
				stroke="var(--v2-primary)"
				strokeWidth={full ? "1.5" : "1.2"}
				strokeLinejoin="round"
				strokeLinecap="round"
			/>
		</svg>
	);
}

// ─── Fill bar ─────────────────────────────────────────────────────────────────

const STATUS_COLOR: Record<string, string> = {
	ok: "bg-[color:var(--v2-primary)]",
	low: "bg-warning",
	critical: "bg-destructive",
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

// ─── ProductionSlides (mini per-unit slider inside a KPI cell) ───────────────

function ProductionSlides({
	slides,
	sub,
}: {
	slides: UnitKpiSlide[];
	sub?: string;
}) {
	const [activeIdx, setActiveIdx] = useState(0);
	const trackRef = useRef<HTMLDivElement>(null);

	function handleScroll() {
		const track = trackRef.current;
		if (!track) return;
		setActiveIdx(Math.round(track.scrollLeft / track.clientWidth));
	}

	if (slides.length === 1) {
		const slide = slides[0]!;
		return (
			<div className="mt-1">
				<p className="text-[10px] text-(--v2-ink-soft)">{slide.unit}</p>
				<p className="text-xl font-semibold leading-none">{slide.value}</p>
				{slide.sparkline && (
					<div className="mt-2 w-full overflow-hidden rounded-md">
						<Sparkline
							data={slide.sparkline}
							full
						/>
					</div>
				)}
				{sub && <p className="mt-1 text-[11px] text-(--v2-ink-soft)">{sub}</p>}
			</div>
		);
	}

	return (
		<div className="mt-1">
			<div
				ref={trackRef}
				onScroll={handleScroll}
				className="flex snap-x snap-mandatory overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
			>
				{slides.map((slide) => (
					<div
						key={slide.unit}
						className="w-full shrink-0 snap-center"
					>
						<p className="text-[10px] text-(--v2-ink-soft)">{slide.unit}</p>
						<p className="text-xl font-semibold leading-none">{slide.value}</p>
						{slide.sparkline && (
							<div className="mt-2 w-full overflow-hidden rounded-md">
								<Sparkline
									data={slide.sparkline}
									full
								/>
							</div>
						)}
					</div>
				))}
			</div>
			<div className="mt-1.5 flex items-center gap-1">
				{slides.map((slide, i) => (
					<Button
						key={slide.unit}
						type="button"
						variant="ghost"
						size="icon"
						aria-label={slide.unit}
						aria-pressed={i === activeIdx}
						onClick={() => {
							trackRef.current?.scrollTo({
								left: i * trackRef.current.clientWidth,
								behavior: "smooth",
							});
							setActiveIdx(i);
						}}
						className={`h-1 rounded-full p-0 transition-all duration-200 hover:bg-transparent ${
							i === activeIdx ? "w-4 bg-(--v2-ink)" : "w-1.5 bg-(--v2-border)"
						}`}
					/>
				))}
				{sub && <p className="ml-1 text-[10px] text-(--v2-ink-soft)">{sub}</p>}
			</div>
		</div>
	);
}

// ─── KpiCell ─────────────────────────────────────────────────────────────────

function KpiCell({ kpi }: { kpi: UnitKpiCard }) {
	return (
		<div className="flex flex-col p-3">
			<p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[color:var(--v2-ink-soft)]">
				{kpi.label}
			</p>
			{kpi.slides ? (
				<ProductionSlides
					slides={kpi.slides}
					sub={kpi.sub}
				/>
			) : kpi.sparkline ? (
				<div className="relative mt-1 flex flex-col">
					<p className="text-xl font-semibold leading-none">{kpi.value}</p>
					{kpi.sub && (
						<p className="mt-0.5 text-[11px] text-(--v2-ink-soft)">{kpi.sub}</p>
					)}
					<div className="mt-2 w-full overflow-hidden rounded-md">
						<Sparkline
							data={kpi.sparkline}
							full
						/>
					</div>
				</div>
			) : (
				<div className="mt-1">
					<p className="text-xl font-semibold leading-none">{kpi.value}</p>
					{kpi.fillPct != null && (
						<FillBar
							pct={kpi.fillPct}
							status={kpi.status}
						/>
					)}
					{kpi.sub && (
						<p className="mt-1 text-[11px] text-(--v2-ink-soft)">{kpi.sub}</p>
					)}
				</div>
			)}
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
	const navigate = useNavigate();
	const icon = CATEGORY_ICON[slice.categoryLabel] ?? "🌿";

	const openDetail = () => {
		navigate({
			to: "/v2/production-units/flock/$unitId",
			params: { unitId: slice.unitId },
			search: { eventType: undefined },
		});
	};

	return (
		<article className="v2-card flex w-full shrink-0 flex-col overflow-hidden">
			{/* Card header */}
			<div
				role="link"
				tabIndex={0}
				onClick={openDetail}
				onKeyDown={(event) => {
					if (event.key === "Enter" || event.key === " ") {
						event.preventDefault();
						openDetail();
					}
				}}
				className="flex cursor-pointer items-center gap-2 border-b border-(--v2-border) px-4 py-3 transition hover:bg-(--v2-surface-raised) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--v2-ink) focus-visible:ring-inset"
			>
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
					<p className="text-[11px] text-(--v2-ink-soft)">
						{slice.categoryLabel}
					</p>
				</div>
				<span className="rounded-full bg-(--v2-accent)/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-(--v2-ink)">
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
						<Button
							key={slice.unitId}
							role="tab"
							variant="ghost"
							size="icon"
							aria-selected={i === activeIndex}
							aria-label={slice.unitName}
							onClick={() => {
								trackRef.current?.scrollTo({
									left: i * (trackRef.current.clientWidth + 12),
									behavior: "smooth",
								});
								setActiveIndex(i);
							}}
							className={`h-1.5 rounded-full p-0 transition-all duration-200 hover:bg-transparent ${
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
