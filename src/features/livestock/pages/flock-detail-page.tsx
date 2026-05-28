import { Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ComponentProps } from "react";
import { ArrowLeft, Plus, Loader2 } from "lucide-react";

import { useGetUserProfile } from "@/features/auth/api/auth-queries";
import {
	useGetLivestockAssetById,
	useListLivestockAssetsByFarmId,
	useListEventsByAssetId,
	useListInfiniteEventsByAssetId,
	useListEventCategoriesByFarmId,
	useListIndividualsByAssetId,
	useGetProfitabilityReport,
	useGetProductionReport,
	useGetAggregatedHeadcountByAssetId,
	useCreateEventByAssetId,
	useCreateMaterialPurchaseByFarmId,
	useCreateMaterialConsumptionByFarmId,
	useCreateMaterialSaleByAssetId,
	useCreateFlockAcquisitionByAssetId,
	useCreateFlockSaleByAssetId,
	useCreateFlockMortalityByAssetId,
	useUpdateEventByAssetId,
	useDeleteEventByAssetId,
	useCreateIndividual,
	useUpdateIndividual,
	useDeleteIndividual,
	useCreateEventCategoryByFarmId,
} from "@/features/livestock/api/livestock-queries";
import { useGetInventorySummaryReport } from "@/features/reports/api/reports-queries";
import type {
	ILivestockAsset,
	ILivestockEvent,
	ILivestockIndividual,
	LivestockEventType,
} from "@/features/livestock/types/livestock-types";

import { IndividualForm } from "../components/individual-form";
import type { IndividualFormData } from "../components/individual-form";
import { IndividualList } from "../components/individual-list";
import { getMaterialActionErrorMessage } from "@/features/inventory/components/material-action-utils";
import { MaterialConsumptionForm } from "@/features/inventory/components/material-consumption-form";
import { MaterialPurchaseForm } from "@/features/inventory/components/material-purchase-form";
import { MaterialSaleForm } from "@/features/inventory/components/material-sale-form";
import { ManualFeedingPanel } from "@/features/livestock/components/manual-feeding-panel";
import { UnitEventForm } from "../components/unit-event-form";
import type { UnitEventFormData } from "../components/unit-event-form";
import { UnitEventTimeline } from "../components/unit-event-timeline";

function formatMoney(value: number): string {
	const sign = value >= 0 ? "+" : "-";
	return `${sign}$${Math.abs(value).toFixed(2)}`;
}

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
						// Keep zero values visually close to baseline to avoid implying production.
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

function ProductionSeriesSlider({
	series,
}: {
	series: ProductionProductSeries[];
}) {
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

function MetricCard(props: {
	label: string;
	value: string;
	note: string;
	isLoading?: boolean;
}) {
	return (
		<div className="v2-card flex-1 p-3">
			<p className="text-[10px] uppercase tracking-[0.08em] text-(--v2-ink-soft)">
				{props.label}
			</p>
			<p className="mt-1 text-2xl font-semibold leading-none">
				{props.isLoading ? (
					<Loader2 className="h-6 w-6 animate-spin" />
				) : (
					props.value
				)}
			</p>
			<p className="mt-1 text-sm text-(--v2-ink-soft)">{props.note}</p>
		</div>
	);
}

interface FlockDetailPageProps {
	unitId: string;
	eventTypeFilter?: string;
	onEventTypeFilterChange?: (next: LivestockEventType | "all") => void;
}

interface ProductionProductSeries {
	productKey: string;
	productLabel: string;
	firstDayLabel: string;
	dayLabels: string[];
	totalLast7Days: number;
	todayCount: number;
	series: number[];
}

type MaterialActionMode = "purchase" | "consumption" | "sale";

const EVENTS_LOG_PAGE_SIZE = 3;

const EVENT_TYPE_FILTER_OPTIONS: Array<{
	value: "all" | LivestockEventType;
	label: string;
}> = [
	{ value: "all", label: "Todos" },
	{ value: "production", label: "Produccion" },
	{ value: "income", label: "Ingreso" },
	{ value: "expense", label: "Gasto" },
	{ value: "observation", label: "Observacion" },
	{ value: "inventory", label: "Inventario" },
	{ value: "reproductive", label: "Reproductivo" },
	{ value: "acquisition", label: "Adquisicion" },
	{ value: "mortality", label: "Mortalidad" },
];

function getEventTypeFilterOptions(
	assetKind: ILivestockAsset["kind"] | undefined,
): Array<{ value: "all" | LivestockEventType; label: string }> {
	if (assetKind === "material") {
		return EVENT_TYPE_FILTER_OPTIONS.filter(
			(option) =>
				option.value !== "reproductive" &&
				option.value !== "acquisition" &&
				option.value !== "mortality",
		);
	}

	if (assetKind === "animal") {
		return EVENT_TYPE_FILTER_OPTIONS;
	}

	return EVENT_TYPE_FILTER_OPTIONS.filter(
		(option) =>
			option.value !== "reproductive" &&
			option.value !== "acquisition" &&
			option.value !== "mortality" &&
			option.value !== "inventory",
	);
}

function isLivestockEventType(value: string): value is LivestockEventType {
	return (
		value === "production" ||
		value === "income" ||
		value === "expense" ||
		value === "observation" ||
		value === "reproductive" ||
		value === "acquisition" ||
		value === "mortality" ||
		value === "inventory"
	);
}

function parseNumeric(value: string | null): number {
	if (!value) return 0;
	const parsed = Number(value);
	return Number.isFinite(parsed) ? parsed : 0;
}

function toModeLabel(asset: ILivestockAsset): string {
	return asset.mode === "aggregated" ? "Aggregate" : "Individual";
}

function toKindLabel(asset: ILivestockAsset): string {
	if (!asset.kind) return "Animal";
	return `${asset.kind.charAt(0).toUpperCase()}${asset.kind.slice(1)}`;
}

function isActionOwnedEvent(event: ILivestockEvent): boolean {
	return typeof event.payload.source === "string";
}

export function FlockDetailPage({
	unitId,
	eventTypeFilter,
	onEventTypeFilterChange,
}: FlockDetailPageProps) {
	const navigate = useNavigate();
	const { data: currentUser } = useGetUserProfile();
	const parsedAssetId = Number(unitId);
	const hasValidAssetId = Number.isInteger(parsedAssetId);
	const farmId = currentUser?.lastVisitedFarmId ?? "";
	const selectedEventType =
		typeof eventTypeFilter === "string" && isLivestockEventType(eventTypeFilter)
			? eventTypeFilter
			: undefined;

	const [isCreatingIndividual, setIsCreatingIndividual] = useState(false);
	const [isCreatingEvent, setIsCreatingEvent] = useState(false);
	const [materialActionMode, setMaterialActionMode] =
		useState<MaterialActionMode | null>(null);
	const [individualSearchQuery, setIndividualSearchQuery] = useState("");
	const [isSavingEvent, setIsSavingEvent] = useState(false);
	const [materialPurchaseError, setMaterialPurchaseError] = useState<
		string | null
	>(null);
	const [materialConsumptionError, setMaterialConsumptionError] = useState<
		string | null
	>(null);
	const [materialSaleError, setMaterialSaleError] = useState<string | null>(
		null,
	);
	const [editingEvent, setEditingEvent] = useState<ILivestockEvent | null>(
		null,
	);
	const [deletingEventId, setDeletingEventId] = useState<number | null>(null);
	const [isAdjustingHeadcount, setIsAdjustingHeadcount] = useState(false);
	const [headcountDraft, setHeadcountDraft] = useState("");
	const [headcountAmountDraft, setHeadcountAmountDraft] = useState("");
	const [headcountDecreaseMode, setHeadcountDecreaseMode] = useState<
		"mortality" | "sale"
	>("mortality");
	const [headcountError, setHeadcountError] = useState<string>("");
	const eventsLoadMoreRef = useRef<HTMLDivElement | null>(null);
	const eventsScrollContainerRef = useRef<HTMLDivElement | null>(null);
	const hasAutoLoadedEventsPageRef = useRef(false);

	const { data: asset, isFetching: isAssetFetching } = useGetLivestockAssetById(
		{
			farmId,
			assetId: parsedAssetId,
			enabled: hasValidAssetId && !!farmId,
		},
	);

	const { data: individualsResponse } = useListIndividualsByAssetId({
		farmId,
		assetId: unitId,
		filters: { pageSize: 100 },
		enabled: !!farmId && !!unitId,
	});

	const {
		data: listedIndividualsResponse,
		isLoading: isLoadingListedIndividuals,
	} = useListIndividualsByAssetId({
		farmId,
		assetId: unitId,
		filters: {
			q: individualSearchQuery.trim() || undefined,
			sort: "-updated_at",
			pageSize: 20,
		},
		enabled: !!farmId && !!unitId,
	});

	const { data: eventCategories = [] } = useListEventCategoriesByFarmId({
		farmId,
		filters: { archived: false, pageSize: 100 },
		enabled: !!farmId,
	});

	const now = new Date();
	const currentMonthStart = new Date(
		now.getFullYear(),
		now.getMonth(),
		1,
	).toISOString();
	const sevenDaysAgo = new Date(
		now.getFullYear(),
		now.getMonth(),
		now.getDate() - 6,
	).toISOString();

	const { data: profitabilityReport } = useGetProfitabilityReport({
		farmId,
		filters: {
			assetId: parsedAssetId,
			dateFrom: currentMonthStart,
		},
		enabled: hasValidAssetId && !!farmId,
	});

	const { data: productionReport } = useGetProductionReport({
		farmId,
		filters: {
			assetId: parsedAssetId,
			bucket: "day",
			type: "production",
			dateFrom: sevenDaysAgo,
		},
		enabled: hasValidAssetId && !!farmId,
	});

	const { data: inventorySummaryReport } = useGetInventorySummaryReport(
		{
			farmId,
			asset_id: parsedAssetId,
		},
		hasValidAssetId && !!farmId && asset?.kind === "material",
	);

	const { data: aggregatedHeadcount, isPending: isAggregatedHeadcountPending } =
		useGetAggregatedHeadcountByAssetId({
			farmId,
			assetId: unitId,
			enabled: !!farmId && !!unitId,
		});

	const eventTypeFilterOptions = useMemo(
		() => getEventTypeFilterOptions(asset?.kind),
		[asset?.kind],
	);
	const effectiveSelectedEventType = useMemo(() => {
		if (!selectedEventType) return undefined;
		return eventTypeFilterOptions.some(
			(option) => option.value === selectedEventType,
		)
			? selectedEventType
			: undefined;
	}, [eventTypeFilterOptions, selectedEventType]);

	const {
		data: eventsLogData,
		isPending: isPendingEventsLog,
		hasNextPage: hasNextEventsLogPage,
		fetchNextPage: fetchNextEventsLogPage,
		isFetchingNextPage: isFetchingNextEventsLogPage,
	} = useListInfiniteEventsByAssetId({
		farmId,
		assetId: unitId,
		filters: { sort: "-occurred_at", type: effectiveSelectedEventType },
		pageSize: EVENTS_LOG_PAGE_SIZE,
		enabled: !!farmId && !!unitId,
	});

	const { data: eventsSummaryResponse } = useListEventsByAssetId({
		farmId,
		assetId: unitId,
		filters: { page: 1, pageSize: 1 },
		enabled: !!farmId && !!unitId,
	});

	const { data: consumerAssetsResponse } = useListLivestockAssetsByFarmId({
		farmId,
		filters: { kind: "animal", pageSize: 100 },
		enabled: !!farmId && asset?.kind === "material",
	});

	// Mutation hooks
	const createEventMutation = useCreateEventByAssetId();
	const createMaterialPurchaseMutation = useCreateMaterialPurchaseByFarmId();
	const createMaterialConsumptionMutation =
		useCreateMaterialConsumptionByFarmId();
	const createMaterialSaleMutation = useCreateMaterialSaleByAssetId();
	const createFlockAcquisitionMutation = useCreateFlockAcquisitionByAssetId();
	const createFlockSaleMutation = useCreateFlockSaleByAssetId();
	const createFlockMortalityMutation = useCreateFlockMortalityByAssetId();
	const updateEventMutation = useUpdateEventByAssetId();
	const deleteEventMutation = useDeleteEventByAssetId();
	const createIndividualMutation = useCreateIndividual();
	const updateIndividualMutation = useUpdateIndividual();
	const deleteIndividualMutation = useDeleteIndividual();
	const createEventCategoryMutation = useCreateEventCategoryByFarmId();

	const allIndividuals = useMemo(
		() => individualsResponse?.data ?? [],
		[individualsResponse?.data],
	);
	const listedIndividuals = listedIndividualsResponse?.data ?? [];
	const consumerAssets = useMemo(
		() =>
			(consumerAssetsResponse?.data ?? []).map((item) => ({
				id: item.id,
				name: item.name,
			})),
		[consumerAssetsResponse?.data],
	);
	const timelineEvents = useMemo(
		() => eventsLogData?.items ?? [],
		[eventsLogData?.items],
	);
	const visibleTimelineEvents = useMemo(() => {
		if (effectiveSelectedEventType) {
			return timelineEvents;
		}

		return timelineEvents.filter((event) => event.type !== "inventory");
	}, [effectiveSelectedEventType, timelineEvents]);
	const hasAssetEvents = (eventsSummaryResponse?.meta.total ?? 0) > 0;

	useEffect(() => {
		hasAutoLoadedEventsPageRef.current = false;
	}, [unitId, effectiveSelectedEventType]);

	useEffect(() => {
		const root = eventsScrollContainerRef.current;
		if (!root || hasAutoLoadedEventsPageRef.current) {
			return;
		}
		if (
			!hasNextEventsLogPage ||
			isPendingEventsLog ||
			isFetchingNextEventsLogPage ||
			timelineEvents.length === 0
		) {
			return;
		}

		if (root.scrollHeight > root.clientHeight + 8) {
			return;
		}

		hasAutoLoadedEventsPageRef.current = true;
		void fetchNextEventsLogPage();
	}, [
		fetchNextEventsLogPage,
		hasNextEventsLogPage,
		isPendingEventsLog,
		isFetchingNextEventsLogPage,
		timelineEvents.length,
		visibleTimelineEvents.length,
	]);

	useEffect(() => {
		const target = eventsLoadMoreRef.current;
		const root = eventsScrollContainerRef.current;
		if (!target || !root || !hasNextEventsLogPage) {
			return;
		}

		const observer = new IntersectionObserver(
			(entries) => {
				const entry = entries[0];
				if (!entry?.isIntersecting || isFetchingNextEventsLogPage) {
					return;
				}

				void fetchNextEventsLogPage();
			},
			{ root, rootMargin: "200px" },
		);

		observer.observe(target);

		return () => {
			observer.disconnect();
		};
	}, [
		fetchNextEventsLogPage,
		hasNextEventsLogPage,
		isFetchingNextEventsLogPage,
		timelineEvents.length,
		visibleTimelineEvents.length,
	]);

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
			if (!dayKeys.includes(key)) continue;

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

	const netMonth = useMemo(() => {
		const assetRow = profitabilityReport?.data.find(
			(row) => row.asset_id === parsedAssetId,
		);
		if (!assetRow) return 0;
		return parseNumeric(assetRow.net);
	}, [profitabilityReport, parsedAssetId]);

	const aggregatedActiveCount = useMemo(() => {
		return aggregatedHeadcount?.net ?? 0;
	}, [aggregatedHeadcount]);

	const parsedHeadcountTarget = useMemo(() => {
		const parsed = Number(headcountDraft);
		if (!Number.isFinite(parsed)) return null;
		return Math.max(0, Math.floor(parsed));
	}, [headcountDraft]);

	const headcountDeltaPreview = useMemo(() => {
		if (parsedHeadcountTarget == null) return null;
		return parsedHeadcountTarget - aggregatedActiveCount;
	}, [parsedHeadcountTarget, aggregatedActiveCount]);

	const countCardValue = useMemo(() => {
		if (asset?.mode === "aggregated") {
			return String(aggregatedActiveCount);
		}
		return `${allIndividuals.length}`;
	}, [asset?.mode, aggregatedActiveCount, allIndividuals.length]);

	const hasDescription = Boolean(asset?.description?.trim());
	const isAnimalAsset = asset?.kind === "animal";
	const isMaterialAsset = asset?.kind === "material";
	const inventoryRows = useMemo(
		() =>
			(inventorySummaryReport?.data ?? []).map((row) => ({
				...row,
				onHand: parseNumeric(row.on_hand),
			})),
		[inventorySummaryReport],
	);
	const totalOnHand = useMemo(
		() => inventoryRows.reduce((sum, row) => sum + row.onHand, 0),
		[inventoryRows],
	);
	const inventoryStatus = useMemo<"ok" | "low" | "critical">(() => {
		if (!inventoryRows.length) return "critical";
		if (totalOnHand <= 0) return "critical";
		if (totalOnHand <= 10) return "low";
		return "ok";
	}, [inventoryRows.length, totalOnHand]);
	const materialActionTitle = useMemo(() => {
		if (materialActionMode === "purchase") return "Registrar compra";
		if (materialActionMode === "consumption") return "Registrar consumo";
		return "Registrar venta";
	}, [materialActionMode]);

	const closeMaterialActionPanel = useCallback(() => {
		setMaterialActionMode(null);
		setMaterialPurchaseError(null);
		setMaterialConsumptionError(null);
		setMaterialSaleError(null);
	}, []);

	const openMaterialActionPanel = useCallback((mode: MaterialActionMode) => {
		setEditingEvent(null);
		setIsCreatingEvent(false);
		setMaterialActionMode(mode);
		setMaterialPurchaseError(null);
		setMaterialConsumptionError(null);
		setMaterialSaleError(null);
	}, []);

	const handleSubmitMaterialPurchase: ComponentProps<
		typeof MaterialPurchaseForm
	>["onSubmit"] = useCallback(
		async (payload) => {
			if (!farmId) return;
			setMaterialPurchaseError(null);

			try {
				await createMaterialPurchaseMutation.mutateAsync({
					farmId,
					data: payload,
				});
				closeMaterialActionPanel();
			} catch (error) {
				setMaterialPurchaseError(
					getMaterialActionErrorMessage(
						error,
						"No se pudo registrar la compra de material.",
					),
				);
			}
		},
		[farmId, createMaterialPurchaseMutation, closeMaterialActionPanel],
	);

	const handleSubmitMaterialConsumption: ComponentProps<
		typeof MaterialConsumptionForm
	>["onSubmit"] = useCallback(
		async (payload) => {
			if (!farmId) return;
			setMaterialConsumptionError(null);

			try {
				await createMaterialConsumptionMutation.mutateAsync({
					farmId,
					data: payload,
				});
				closeMaterialActionPanel();
			} catch (error) {
				setMaterialConsumptionError(
					getMaterialActionErrorMessage(
						error,
						"No se pudo registrar el consumo de material.",
					),
				);
			}
		},
		[farmId, createMaterialConsumptionMutation, closeMaterialActionPanel],
	);

	const handleSubmitMaterialSale: ComponentProps<
		typeof MaterialSaleForm
	>["onSubmit"] = useCallback(
		async (payload) => {
			if (!farmId || !unitId) return;
			setMaterialSaleError(null);

			try {
				await createMaterialSaleMutation.mutateAsync({
					farmId,
					assetId: unitId,
					data: payload,
				});
				closeMaterialActionPanel();
			} catch (error) {
				setMaterialSaleError(
					getMaterialActionErrorMessage(
						error,
						"No se pudo registrar la venta de material.",
					),
				);
			}
		},
		[farmId, unitId, createMaterialSaleMutation, closeMaterialActionPanel],
	);

	const handleCreateIndividual = useCallback(
		async (data: IndividualFormData) => {
			if (!farmId || !unitId) return;

			await createIndividualMutation.mutateAsync({
				farmId,
				assetId: unitId,
				data: {
					name: data.name ?? "",
					tag: data.tag,
					birth_date: data.birthDate,
					mother_id: data.motherId != null ? Number(data.motherId) : undefined,
					father_id: data.fatherId != null ? Number(data.fatherId) : undefined,
					extra: data.sex ? { sex: data.sex } : undefined,
				},
			});

			setIsCreatingIndividual(false);
		},
		[farmId, unitId, createIndividualMutation],
	);

	const handleDeleteIndividual = useCallback(
		async (individual: ILivestockIndividual) => {
			if (!farmId || !unitId) return;

			await deleteIndividualMutation.mutateAsync({
				farmId,
				assetId: unitId,
				individualId: String(individual.id),
			});
		},
		[farmId, unitId, deleteIndividualMutation],
	);

	const handleUpdateIndividual = useCallback(
		async (individual: ILivestockIndividual, data: IndividualFormData) => {
			if (!farmId || !unitId) return;

			await updateIndividualMutation.mutateAsync({
				farmId,
				assetId: unitId,
				individualId: String(individual.id),
				data: {
					name: data.name ?? individual.name,
					tag: data.tag,
					mother_id:
						data.motherId != null
							? Number(data.motherId)
							: individual.mother_id,
					father_id:
						data.fatherId != null
							? Number(data.fatherId)
							: individual.father_id,
					status: data.status ?? individual.status,
					extra: {
						...individual.extra,
						...(data.sex !== undefined ? { sex: data.sex } : {}),
					},
				},
			});
		},
		[farmId, unitId, updateIndividualMutation],
	);

	const handleSelectIndividual = useCallback(
		(individual: ILivestockIndividual) => {
			navigate({
				to: "/v2/production-units/flock/$unitId/individuals/$individualId",
				params: { unitId, individualId: String(individual.id) },
				search: {
					eventType: effectiveSelectedEventType,
					edit: false,
				},
			});
		},
		[navigate, unitId, effectiveSelectedEventType],
	);

	const handleCreateEvent = useCallback(
		async (data: UnitEventFormData) => {
			if (!farmId || !unitId || !asset) return;
			if (data.type === "reproductive" && data.individualId == null) return;

			setIsSavingEvent(true);
			try {
				if (data.type === "production") {
					await createEventMutation.mutateAsync({
						farmId,
						assetId: unitId,
						data: {
							type: "production",
							occurred_at: data.occurredAt,
							quantity: data.quantity ?? 0,
							unit: data.unit ?? "unit",
							category_id: data.categoryId,
							individual_id: data.individualId,
							notes: data.notes,
							payload: { status: data.status },
						},
					});
				} else if (data.type === "expense" || data.type === "income") {
					await createEventMutation.mutateAsync({
						farmId,
						assetId: unitId,
						data: {
							type: data.type,
							occurred_at: data.occurredAt,
							amount: data.amount ?? 0,
							category_id: data.categoryId,
							individual_id: data.individualId,
							notes: data.notes,
							payload: { status: data.status },
						},
					});
				} else if (data.type === "observation") {
					await createEventMutation.mutateAsync({
						farmId,
						assetId: unitId,
						data: {
							type: "observation",
							occurred_at: data.occurredAt,
							category_id: data.categoryId,
							individual_id: data.individualId,
							quantity: data.quantity,
							unit: data.unit,
							notes: data.notes,
							payload: { status: data.status },
						},
					});
				} else if (data.type === "inventory") {
					await createEventMutation.mutateAsync({
						farmId,
						assetId: unitId,
						data: {
							type: "inventory",
							occurred_at: data.occurredAt,
							adjustment: data.adjustment ?? "increment",
							quantity: data.quantity ?? 0,
							unit: data.unit ?? "unit",
							category_id: data.categoryId,
							individual_id: data.individualId,
							notes: data.notes,
							payload: { status: data.status },
						},
					});
				} else {
					await createEventMutation.mutateAsync({
						farmId,
						assetId: unitId,
						data: {
							type: "reproductive",
							occurred_at: data.occurredAt,
							individual_id: data.individualId!,
							category_id: data.categoryId,
							notes: data.notes,
							payload: { status: data.status },
						},
					});
				}

				setIsCreatingEvent(false);
			} finally {
				setIsSavingEvent(false);
			}
		},
		[farmId, unitId, createEventMutation, asset],
	);

	const handleStartEditEvent = useCallback((event: ILivestockEvent) => {
		if (isActionOwnedEvent(event)) {
			alert(
				"Este evento fue generado por una accion del sistema. Edita la accion original para mantener consistencia.",
			);
			return;
		}

		setEditingEvent(event);
		setIsCreatingEvent(true);
	}, []);

	const handleDeleteEvent = useCallback(
		async (event: ILivestockEvent) => {
			if (!farmId || !unitId) return;
			if (isActionOwnedEvent(event)) {
				alert(
					"Este evento fue generado por una accion del sistema. Eliminalo desde la accion original para evitar desbalances.",
				);
				return;
			}
			if (!confirm("Eliminar este evento?")) return;

			setDeletingEventId(event.id);
			try {
				await deleteEventMutation.mutateAsync({
					farmId,
					assetId: unitId,
					eventId: event.id,
				});

				if (editingEvent?.id === event.id) {
					setEditingEvent(null);
					setIsCreatingEvent(false);
				}
			} finally {
				setDeletingEventId(null);
			}
		},
		[farmId, unitId, editingEvent, deleteEventMutation],
	);

	const handleSubmitEvent = useCallback(
		async (data: UnitEventFormData) => {
			if (!editingEvent) {
				await handleCreateEvent(data);
				return;
			}
			if (isActionOwnedEvent(editingEvent)) {
				alert(
					"Este evento fue generado por una accion del sistema. Edita la accion original para mantener consistencia.",
				);
				setEditingEvent(null);
				setIsCreatingEvent(false);
				return;
			}
			if (!farmId || !unitId || !asset) return;

			setIsSavingEvent(true);
			try {
				const nextIndividualId =
					asset.mode === "individual" ? (data.individualId ?? null) : null;
				await updateEventMutation.mutateAsync({
					farmId,
					assetId: unitId,
					eventId: editingEvent.id,
					data: {
						occurred_at: data.occurredAt,
						individual_id: nextIndividualId,
						category_id: data.categoryId ?? null,
						notes: data.notes ?? null,
						payload: { ...editingEvent.payload, status: data.status },
						quantity:
							editingEvent.type === "production" ||
							editingEvent.type === "observation" ||
							editingEvent.type === "acquisition" ||
							editingEvent.type === "mortality" ||
							editingEvent.type === "inventory"
								? (data.quantity ?? null)
								: null,
						unit:
							editingEvent.type === "production" ||
							editingEvent.type === "observation" ||
							editingEvent.type === "acquisition" ||
							editingEvent.type === "inventory"
								? (data.unit ?? null)
								: null,
						amount:
							editingEvent.type === "income" ||
							editingEvent.type === "expense" ||
							editingEvent.type === "acquisition"
								? (data.amount ?? null)
								: null,
						adjustment:
							editingEvent.type === "inventory"
								? (data.adjustment ?? null)
								: null,
					},
				});

				setEditingEvent(null);
				setIsCreatingEvent(false);
			} finally {
				setIsSavingEvent(false);
			}
		},
		[
			editingEvent,
			handleCreateEvent,
			farmId,
			unitId,
			updateEventMutation,
			asset,
		],
	);

	const handleCreateEventCategory = useCallback(
		async ({
			type,
			name,
			color,
		}: {
			type: LivestockEventType;
			name: string;
			color?: string;
		}) => {
			if (!farmId) {
				throw new Error("Farm id is required to create categories.");
			}

			const createdCategory = await createEventCategoryMutation.mutateAsync({
				farmId,
				data: {
					type,
					name,
					color,
				},
			});

			return createdCategory.id;
		},
		[farmId, createEventCategoryMutation],
	);

	const openHeadcountAdjustment = useCallback(() => {
		setHeadcountError("");
		setHeadcountDraft(String(aggregatedActiveCount));
		setHeadcountAmountDraft("");
		setHeadcountDecreaseMode("mortality");
		setIsAdjustingHeadcount(true);
	}, [aggregatedActiveCount]);

	const closeHeadcountAdjustment = useCallback(() => {
		setIsAdjustingHeadcount(false);
		setHeadcountError("");
		setHeadcountAmountDraft("");
		setHeadcountDecreaseMode("mortality");
	}, []);

	const handleApplyHeadcountAdjustment = useCallback(async () => {
		if (!farmId || !unitId || !asset) return;
		if (!(asset.kind === "animal" && asset.mode === "aggregated")) return;

		const parsedTarget = Number(headcountDraft);
		const target = Number.isFinite(parsedTarget)
			? Math.max(0, Math.floor(parsedTarget))
			: NaN;

		if (!Number.isFinite(target)) {
			setHeadcountError("Ingresa un conteo valido.");
			return;
		}

		const delta = target - aggregatedActiveCount;
		if (delta === 0) {
			closeHeadcountAdjustment();
			return;
		}

		setHeadcountError("");
		if (delta > 0) {
			const parsedAmount = Number(headcountAmountDraft);
			const hasAmount = headcountAmountDraft.trim().length > 0;

			if (hasAmount && (!Number.isFinite(parsedAmount) || parsedAmount < 0)) {
				setHeadcountError("Ingresa un costo valido o dejalo vacio.");
				return;
			}

			await createFlockAcquisitionMutation.mutateAsync({
				farmId,
				assetId: unitId,
				payload: {
					occurred_at: new Date().toISOString(),
					quantity: delta,
					amount: hasAmount ? parsedAmount : null,
				},
			});
		} else {
			if (headcountDecreaseMode === "sale") {
				const parsedAmount = Number(headcountAmountDraft);

				if (
					headcountAmountDraft.trim().length === 0 ||
					!Number.isFinite(parsedAmount) ||
					parsedAmount < 0
				) {
					setHeadcountError("Para una venta debes ingresar un ingreso valido.");
					return;
				}

				await createFlockSaleMutation.mutateAsync({
					farmId,
					assetId: unitId,
					payload: {
						occurred_at: new Date().toISOString(),
						quantity: Math.abs(delta),
						amount: parsedAmount,
					},
				});
			} else {
				await createFlockMortalityMutation.mutateAsync({
					farmId,
					assetId: unitId,
					payload: {
						occurred_at: new Date().toISOString(),
						quantity: Math.abs(delta),
						cause: "Ajuste manual de conteo",
					},
				});
			}
		}

		closeHeadcountAdjustment();
	}, [
		farmId,
		unitId,
		asset,
		headcountDraft,
		headcountAmountDraft,
		headcountDecreaseMode,
		aggregatedActiveCount,
		createFlockAcquisitionMutation,
		createFlockSaleMutation,
		createFlockMortalityMutation,
		closeHeadcountAdjustment,
	]);

	const backToAssetsPath = asset?.kind != null ? "kind" : "root";

	useEffect(() => {
		if (typeof window === "undefined") return;

		// Keep this page at the top of history so edge-swipe back does not leave it.
		window.history.pushState(
			{ flockDetailGuard: true },
			"",
			window.location.href,
		);

		const handlePopState = () => {
			window.history.pushState(
				{ flockDetailGuard: true },
				"",
				window.location.href,
			);
		};

		window.addEventListener("popstate", handlePopState);

		return () => {
			window.removeEventListener("popstate", handlePopState);
		};
	}, []);

	if (!farmId) {
		return (
			<section className="space-y-4">
				<div className="v2-card p-5">
					<p className="v2-kicker">Activos</p>
					<h1 className="mt-2 text-xl font-semibold">Selecciona una granja</h1>
					<p className="mt-1 text-sm text-(--v2-ink-soft)">
						No hay granja activa para cargar datos reales.
					</p>
				</div>
			</section>
		);
	}

	if (hasValidAssetId && !asset && isAssetFetching) {
		return (
			<section className="space-y-4">
				<div className="v2-card p-5">
					<p className="text-sm text-(--v2-ink-soft)">Cargando activo...</p>
				</div>
			</section>
		);
	}

	if (!asset) {
		return (
			<section className="space-y-4">
				<div className="v2-card p-5">
					<p className="v2-kicker">Activos</p>
					<h1 className="mt-2 text-xl font-semibold">Activo no encontrado</h1>
					<p className="mt-1 text-sm text-(--v2-ink-soft)">
						No encontramos el activo solicitado.
					</p>
					<Link
						to="/v2/production-units"
						className="mt-4 inline-flex rounded-full border border-(--v2-ink) px-3 py-1.5 text-xs font-semibold"
					>
						Volver a activos
					</Link>
				</div>
			</section>
		);
	}

	return (
		<section className="space-y-4">
			<div className="v2-card p-5">
				<div className="min-w-0 flex-1">
					<div className="mb-2 flex items-center justify-between gap-3">
						<div className="flex items-center gap-2">
							<span className="rounded-md bg-[#e7d7ae] px-2.5 py-1 text-xs font-semibold text-[#6f5413]">
								{toKindLabel(asset)}
							</span>
							<span className="rounded-md border border-(--v2-border) bg-white px-2.5 py-1 text-xs font-semibold text-(--v2-ink)">
								{toModeLabel(asset)}
							</span>
						</div>
						{backToAssetsPath === "kind" && asset.kind ? (
							<Link
								to="/v2/production-units/$assetKind"
								params={{ assetKind: asset.kind }}
								className="inline-flex items-center justify-center p-1 text-(--v2-ink-soft) transition-colors hover:text-(--v2-ink)"
								aria-label="Volver a activos"
							>
								<ArrowLeft
									aria-hidden="true"
									className="h-6 w-6"
								/>
							</Link>
						) : (
							<Link
								to="/v2/production-units"
								className="inline-flex items-center justify-center p-1 text-(--v2-ink-soft) transition-colors hover:text-(--v2-ink)"
								aria-label="Volver a activos"
							>
								<ArrowLeft
									aria-hidden="true"
									className="h-6 w-6"
								/>
							</Link>
						)}
					</div>
					<div className="flex items-center gap-2">
						<h1
							className="text-3xl font-bold leading-tight md:text-[2.35rem]"
							style={{ color: "#006847", fontFamily: "var(--v2-font-display)" }}
						>
							{asset.name}
						</h1>
					</div>
					<div className="mt-3 inline-flex max-w-full items-center gap-2 rounded-xl border border-(--v2-border) bg-[#ecf0e8] px-3 py-1.5 text-sm text-(--v2-ink)">
						<span className="inline-flex h-5 w-5 items-center justify-center text-[#0e6b49]">
							<svg
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
								className="h-4 w-4"
							>
								<path d="M12 21s-6-5.5-6-11a6 6 0 1 1 12 0c0 5.5-6 11-6 11Z" />
								<circle
									cx="12"
									cy="10"
									r="2"
								/>
							</svg>
						</span>
						<span className="truncate">
							{asset.location ?? "Sin ubicacion"}
						</span>
					</div>
					{hasDescription ? (
						<>
							<div className="mt-4 border-t border-(--v2-border)" />
							<div className="mt-4 flex justify-center">
								<blockquote
									className="max-w-2xl text-center text-lg italic leading-snug text-(--v2-primary) md:text-xl"
									style={{
										fontFamily:
											'"Segoe Script", "Bradley Hand", "Comic Sans MS", cursive',
									}}
								>
									&quot;{asset.description?.trim()}&quot;
								</blockquote>
							</div>
						</>
					) : null}
				</div>
			</div>

			{isMaterialAsset ? (
				<div className="v2-card p-4">
					<div className="mb-3 flex items-center justify-between gap-3">
						<div>
							<p className="v2-kicker">Inventario actual</p>
							<p className="text-sm text-(--v2-ink-soft)">
								{inventoryRows.length === 0
									? "No hay movimientos registrados"
									: `${inventoryRows.length} unidad(es) de medida activas`}
							</p>
						</div>
						<span
							className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
								inventoryStatus === "critical"
									? "bg-red-100 text-red-700"
									: inventoryStatus === "low"
										? "bg-amber-100 text-amber-700"
										: "bg-emerald-100 text-emerald-700"
							}`}
						>
							{inventoryStatus === "critical"
								? "Critico"
								: inventoryStatus === "low"
									? "Bajo"
									: "OK"}
						</span>
					</div>

					{inventoryRows.length === 0 ? (
						<p className="text-sm text-(--v2-ink-soft)">
							Registra un primer movimiento de inventario para activar stock.
						</p>
					) : (
						<div className="space-y-2">
							{inventoryRows.map((row) => (
								<div
									key={`${row.asset_id}-${row.unit}`}
									className="flex items-center justify-between rounded-lg border border-(--v2-border) bg-white px-3 py-2"
								>
									<span className="text-sm font-medium">{row.unit}</span>
									<span className="text-sm font-semibold">
										{row.onHand.toFixed(2)}
									</span>
								</div>
							))}
						</div>
					)}

					<div className="mt-3 grid gap-2 sm:grid-cols-3">
						<button
							type="button"
							onClick={() => {
								openMaterialActionPanel("purchase");
							}}
							className="rounded-full bg-(--v2-ink) px-3 py-1.5 text-xs font-semibold text-white"
						>
							Agregar (compra)
						</button>
						<button
							type="button"
							onClick={() => {
								openMaterialActionPanel("consumption");
							}}
							className="rounded-full border border-(--v2-border) bg-white px-3 py-1.5 text-xs font-semibold"
						>
							Reducir (consumo)
						</button>
						<button
							type="button"
							onClick={() => {
								openMaterialActionPanel("sale");
							}}
							className="rounded-full border border-(--v2-border) bg-white px-3 py-1.5 text-xs font-semibold"
						>
							Reducir (venta)
						</button>
					</div>

					{materialActionMode ? (
						<div className="mt-3 rounded-xl border border-(--v2-border) bg-white p-3">
							<div className="mb-3 flex items-center justify-between gap-3">
								<p className="text-xs font-semibold uppercase tracking-[0.08em] text-(--v2-ink-soft)">
									{materialActionTitle}
								</p>
								<button
									type="button"
									onClick={closeMaterialActionPanel}
									className="rounded-full border border-(--v2-border) px-2.5 py-1 text-xs font-semibold"
								>
									Cerrar
								</button>
							</div>

							{materialActionMode === "purchase" ? (
								<MaterialPurchaseForm
									materialAssetId={asset.id}
									isSubmitting={createMaterialPurchaseMutation.isPending}
									errorMessage={materialPurchaseError}
									onSubmit={handleSubmitMaterialPurchase}
								/>
							) : null}

							{materialActionMode === "consumption" ? (
								<MaterialConsumptionForm
									materialAssetId={asset.id}
									consumerAssets={consumerAssets}
									isSubmitting={createMaterialConsumptionMutation.isPending}
									errorMessage={materialConsumptionError}
									onSubmit={handleSubmitMaterialConsumption}
								/>
							) : null}

							{materialActionMode === "sale" ? (
								<MaterialSaleForm
									isSubmitting={createMaterialSaleMutation.isPending}
									errorMessage={materialSaleError}
									onSubmit={handleSubmitMaterialSale}
								/>
							) : null}
						</div>
					) : null}
				</div>
			) : null}

			{!isMaterialAsset && productionSeries.length > 0 ? (
				<div className="grid gap-3">
					<ProductionSeriesSlider series={productionSeries} />
				</div>
			) : null}

			{isAnimalAsset ? (
				<ManualFeedingPanel
					farmId={farmId}
					consumerAssetId={asset.id}
					consumerAssetName={asset.name}
				/>
			) : null}

			<div className="grid gap-3 md:grid-cols-2">
				{!isMaterialAsset && asset.mode === "aggregated" ? (
					<div className="v2-card flex-1 p-3">
						<div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
							<div className="min-w-0">
								<p className="text-[10px] uppercase tracking-[0.08em] text-(--v2-ink-soft)">
									Existencia actual
								</p>
								<p className="mt-0.5 text-2xl font-semibold leading-none">
									{isAggregatedHeadcountPending ? (
										<Loader2 className="h-6 w-6 animate-spin" />
									) : (
										countCardValue
									)}
								</p>
							</div>
							{!isAdjustingHeadcount ? (
								<div className="flex h-full items-center border-l border-(--v2-border) pl-3">
									<button
										type="button"
										onClick={openHeadcountAdjustment}
										className="h-fit whitespace-nowrap rounded-full border border-(--v2-ink) px-3 py-1 text-xs font-semibold"
									>
										Ajustar
									</button>
								</div>
							) : null}
						</div>

						{isAdjustingHeadcount ? (
							<div className="mt-2 rounded-xl border border-(--v2-border) bg-white p-2">
								<div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] md:items-end">
									<label className="space-y-1 text-xs">
										<span className="font-medium">Actual</span>
										<p className="rounded-lg border border-(--v2-border) bg-gray-50 px-2 py-1.5">
											{aggregatedActiveCount}
										</p>
									</label>
									<label className="space-y-1 text-xs">
										<span className="font-medium">Nuevo</span>
										<input
											type="number"
											min="0"
											step="1"
											value={headcountDraft}
											onChange={(event) =>
												setHeadcountDraft(event.target.value)
											}
											className="w-full rounded-lg border border-(--v2-border) px-2 py-1.5"
										/>
									</label>
								</div>
								{headcountDeltaPreview != null && headcountDeltaPreview > 0 ? (
									<div className="mt-2 grid gap-2 md:grid-cols-2">
										<label className="space-y-1 text-xs">
											<span className="font-medium">Costo (opcional)</span>
											<input
												type="number"
												min="0"
												step="0.01"
												value={headcountAmountDraft}
												onChange={(event) =>
													setHeadcountAmountDraft(event.target.value)
												}
												placeholder="Ej: 125.50"
												className="w-full rounded-lg border border-(--v2-border) px-2 py-1.5"
											/>
										</label>
									</div>
								) : null}
								{headcountDeltaPreview != null && headcountDeltaPreview < 0 ? (
									<div className="mt-2 grid gap-2 md:grid-cols-2">
										<label className="space-y-1 text-xs">
											<span className="font-medium">Tipo de salida</span>
											<select
												value={headcountDecreaseMode}
												onChange={(event) =>
													setHeadcountDecreaseMode(
														event.target.value as "mortality" | "sale",
													)
												}
												className="w-full rounded-lg border border-(--v2-border) px-2 py-1.5"
											>
												<option value="mortality">Mortalidad</option>
												<option value="sale">Venta</option>
											</select>
										</label>
										{headcountDecreaseMode === "sale" ? (
											<>
												<label className="space-y-1 text-xs">
													<span className="font-medium">
														Ingreso (requerido)
													</span>
													<input
														type="number"
														min="0"
														step="0.01"
														value={headcountAmountDraft}
														onChange={(event) =>
															setHeadcountAmountDraft(event.target.value)
														}
														placeholder="Ej: 250.00"
														className="w-full rounded-lg border border-(--v2-border) px-2 py-1.5"
													/>
												</label>
											</>
										) : null}
									</div>
								) : null}
								{headcountError ? (
									<p className="mt-2 text-xs text-red-600">{headcountError}</p>
								) : null}
								<div className="mt-3 flex items-center gap-2 md:justify-end">
									<button
										type="button"
										onClick={() => void handleApplyHeadcountAdjustment()}
										disabled={
											createFlockAcquisitionMutation.isPending ||
											createFlockSaleMutation.isPending ||
											createFlockMortalityMutation.isPending
										}
										className="rounded-full bg-(--v2-ink) px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
									>
										{createFlockAcquisitionMutation.isPending ||
										createFlockSaleMutation.isPending ||
										createFlockMortalityMutation.isPending
											? "Aplicando..."
											: "Aplicar"}
									</button>
									<button
										type="button"
										onClick={closeHeadcountAdjustment}
										className="rounded-full border border-(--v2-border) px-3 py-1.5 text-xs font-semibold"
									>
										Cancelar
									</button>
								</div>
							</div>
						) : null}
					</div>
				) : null}
				<MetricCard
					label={isMaterialAsset ? "Valor neto · mes" : "Neto · mes"}
					value={formatMoney(netMonth)}
					note={
						isMaterialAsset
							? "Calculado con movimientos financieros del activo"
							: "Calculado con eventos de ingreso y gasto del mes"
					}
				/>
			</div>

			<div className="v2-card p-4">
				<div className="mb-3 flex items-center justify-between gap-3">
					<div className="flex items-center gap-2">
						<p className="v2-kicker">Eventos del activo</p>
						{hasAssetEvents ? (
							<select
								value={effectiveSelectedEventType ?? "all"}
								onChange={(event) => {
									const nextValue = event.target.value;
									if (nextValue === "all") {
										onEventTypeFilterChange?.("all");
										return;
									}

									if (!isLivestockEventType(nextValue)) {
										return;
									}

									onEventTypeFilterChange?.(nextValue);
								}}
								className="rounded-full border border-(--v2-border) bg-white px-3 py-1 text-xs font-medium text-(--v2-ink)"
								aria-label="Filtrar eventos por tipo"
							>
								{eventTypeFilterOptions.map((option) => (
									<option
										key={option.value}
										value={option.value}
									>
										{option.label}
									</option>
								))}
							</select>
						) : null}
					</div>
					{!isMaterialAsset ? (
						<button
							type="button"
							onClick={() => {
								setIsCreatingEvent((previous) => {
									const next = !previous;
									if (next) {
										closeMaterialActionPanel();
									}
									if (!next) {
										setEditingEvent(null);
										setMaterialActionMode(null);
									}
									return next;
								});
								setMaterialPurchaseError(null);
								setMaterialConsumptionError(null);
								setMaterialSaleError(null);
							}}
							className="inline-flex items-center gap-2 rounded-full border border-(--v2-ink) px-3 py-1 text-xs font-semibold"
							aria-label={isCreatingEvent ? "Cerrar" : "Nuevo evento"}
						>
							{isCreatingEvent ? (
								<>
									<span className="hidden md:inline">Cerrar</span>
									<span
										className="md:hidden"
										aria-hidden="true"
									>
										×
									</span>
								</>
							) : (
								<>
									<Plus
										aria-hidden="true"
										className="h-3.5 w-3.5 md:hidden"
									/>
									<span className="hidden md:inline">Nuevo evento</span>
								</>
							)}
						</button>
					) : null}
				</div>

				{isCreatingEvent ? (
					<div className="mb-4 rounded-xl border border-(--v2-border) bg-white p-3">
						<UnitEventForm
							categories={eventCategories}
							individuals={allIndividuals}
							assetKind={asset.kind}
							assetMode={asset.mode}
							onSubmit={handleSubmitEvent}
							onCancel={() => {
								setIsCreatingEvent(false);
								setEditingEvent(null);
							}}
							isSubmitting={isSavingEvent}
							onCreateEventCategory={handleCreateEventCategory}
							initialValues={
								editingEvent
									? {
											type: editingEvent.type,
											categoryId: editingEvent.category_id ?? undefined,
											status:
												typeof editingEvent.payload.status === "string" &&
												editingEvent.payload.status === "planned"
													? "planned"
													: "logged",
											occurredAt: editingEvent.occurred_at,
											individualId: editingEvent.individual_id ?? undefined,
											quantity:
												editingEvent.quantity != null
													? Number(editingEvent.quantity)
													: undefined,
											unit: editingEvent.unit ?? undefined,
											amount:
												editingEvent.amount != null
													? Number(editingEvent.amount)
													: undefined,
											adjustment: editingEvent.adjustment ?? undefined,
											notes: editingEvent.notes ?? undefined,
										}
									: undefined
							}
							submitLabel={
								editingEvent ? "Actualizar evento" : "Guardar evento"
							}
						/>
					</div>
				) : null}

				<div
					ref={eventsScrollContainerRef}
					className="max-h-104 overflow-y-auto pr-1"
				>
					<UnitEventTimeline
						events={visibleTimelineEvents}
						categories={eventCategories}
						onEditEvent={isMaterialAsset ? undefined : handleStartEditEvent}
						onDeleteEvent={isMaterialAsset ? undefined : handleDeleteEvent}
						deletingEventId={deletingEventId}
						editingEventId={editingEvent?.id ?? null}
					/>
					{hasNextEventsLogPage ? (
						<div
							ref={eventsLoadMoreRef}
							className="h-2"
						/>
					) : null}
				</div>
				{isPendingEventsLog ? (
					<p className="mt-2 text-xs text-(--v2-ink-soft)">
						Actualizando eventos...
					</p>
				) : null}
				{isFetchingNextEventsLogPage ? (
					<p className="mt-2 text-xs text-(--v2-ink-soft)">
						Cargando mas eventos...
					</p>
				) : null}
			</div>

			{isAnimalAsset && asset.mode !== "aggregated" ? (
				<div className="rounded-lg border border-gray-200 bg-white p-6">
					{isCreatingIndividual ? (
						<div>
							<h3 className="mb-4 text-lg font-bold">Agregar individuo</h3>
							<IndividualForm
								availableParents={allIndividuals}
								onSubmit={handleCreateIndividual}
								onCancel={() => setIsCreatingIndividual(false)}
								isLoading={createIndividualMutation.isPending}
							/>
						</div>
					) : (
						<IndividualList
							individuals={listedIndividuals}
							availableParents={allIndividuals}
							totalIndividuals={listedIndividualsResponse?.meta.total}
							searchQuery={individualSearchQuery}
							onSearchQueryChange={setIndividualSearchQuery}
							isLoading={isLoadingListedIndividuals}
							onSelectIndividual={handleSelectIndividual}
							onUpdateIndividual={handleUpdateIndividual}
							onDeleteIndividual={handleDeleteIndividual}
							onCreateIndividual={() => setIsCreatingIndividual(true)}
							isUpdatingIndividual={updateIndividualMutation.isPending}
						/>
					)}
				</div>
			) : null}
		</section>
	);
}
