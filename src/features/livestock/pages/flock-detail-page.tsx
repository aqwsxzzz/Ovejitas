import { Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Plus } from "lucide-react";

import { useGetUserProfile } from "@/features/auth/api/auth-queries";
import {
	useGetLivestockAssetById,
	useListInfiniteEventsByAssetId,
	useListEventCategoriesByFarmId,
	useListIndividualsByAssetId,
	useGetProfitabilityReport,
	useGetProductionReport,
	useGetAggregatedHeadcountByAssetId,
	useCreateEventByAssetId,
	useUpdateEventByAssetId,
	useDeleteEventByAssetId,
	useCreateIndividual,
	useDeleteIndividual,
	useCreateEventCategoryByFarmId,
} from "@/features/livestock/api/livestock-queries";
import type {
	ILivestockAsset,
	ILivestockEvent,
	ILivestockIndividual,
	LivestockEventType,
} from "@/features/livestock/types/livestock-types";

import { IndividualForm } from "../components/individual-form";
import type { IndividualFormData } from "../components/individual-form";
import { IndividualList } from "../components/individual-list";
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
							index === activeIndex ? "bg-[color:var(--v2-ink)]" : "bg-black/30"
						}`}
					/>
				))}
			</div>
		</div>
	);
}

function MetricCard(props: { label: string; value: string; note: string }) {
	return (
		<div className="v2-card flex-1 p-3">
			<p className="text-[10px] uppercase tracking-[0.08em] text-[color:var(--v2-ink-soft)]">
				{props.label}
			</p>
			<p className="mt-1 text-2xl font-semibold leading-none">{props.value}</p>
			<p className="mt-1 text-sm text-[color:var(--v2-ink-soft)]">
				{props.note}
			</p>
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
	{ value: "reproductive", label: "Reproductivo" },
	{ value: "acquisition", label: "Adquisicion" },
	{ value: "mortality", label: "Mortalidad" },
];

function isLivestockEventType(value: string): value is LivestockEventType {
	return (
		value === "production" ||
		value === "income" ||
		value === "expense" ||
		value === "observation" ||
		value === "reproductive" ||
		value === "acquisition" ||
		value === "mortality"
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

function buildEventPairIdempotencyPrefix(
	type: "income" | "expense" | "acquisition",
): string {
	return `${type}-${crypto.randomUUID()}`;
}

function isChainedLegEvent(event: ILivestockEvent): boolean {
	return typeof event.payload.chain_role === "string";
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
	const [individualSearchQuery, setIndividualSearchQuery] = useState("");
	const [isSavingEvent, setIsSavingEvent] = useState(false);
	const [editingEvent, setEditingEvent] = useState<ILivestockEvent | null>(
		null,
	);
	const [deletingEventId, setDeletingEventId] = useState<number | null>(null);
	const eventsLoadMoreRef = useRef<HTMLDivElement | null>(null);
	const eventsScrollContainerRef = useRef<HTMLDivElement | null>(null);
	const hasAutoLoadedEventsPageRef = useRef(false);
	const swipeStartXRef = useRef<number | null>(null);
	const swipeStartYRef = useRef<number | null>(null);
	const isSwipeCandidateRef = useRef(false);

	const { data: asset, isFetching: isAssetFetching } = useGetLivestockAssetById(
		{
			farmId,
			assetId: parsedAssetId,
			enabled: hasValidAssetId && !!farmId,
		},
	);

	const { data: individualsResponse, isLoading: isLoadingIndividuals } =
		useListIndividualsByAssetId({
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

	const { data: aggregatedHeadcount } = useGetAggregatedHeadcountByAssetId({
		farmId,
		assetId: unitId,
		enabled: !!farmId && !!unitId,
	});

	const {
		data: eventsLogData,
		isPending: isPendingEventsLog,
		hasNextPage: hasNextEventsLogPage,
		fetchNextPage: fetchNextEventsLogPage,
		isFetchingNextPage: isFetchingNextEventsLogPage,
	} = useListInfiniteEventsByAssetId({
		farmId,
		assetId: unitId,
		filters: { sort: "-occurred_at", type: selectedEventType },
		pageSize: EVENTS_LOG_PAGE_SIZE,
		enabled: !!farmId && !!unitId,
	});

	// Mutation hooks
	const createEventMutation = useCreateEventByAssetId();
	const updateEventMutation = useUpdateEventByAssetId();
	const deleteEventMutation = useDeleteEventByAssetId();
	const createIndividualMutation = useCreateIndividual();
	const deleteIndividualMutation = useDeleteIndividual();
	const createEventCategoryMutation = useCreateEventCategoryByFarmId();

	const allIndividuals = useMemo(
		() => individualsResponse?.data ?? [],
		[individualsResponse?.data],
	);
	const listedIndividuals = listedIndividualsResponse?.data ?? [];
	const timelineEvents = useMemo(
		() => eventsLogData?.items ?? [],
		[eventsLogData?.items],
	);

	const preferredSecondaryCategoryByType = useMemo(() => {
		const resolveByType = (
			type: Extract<LivestockEventType, "acquisition" | "mortality">,
		): number | undefined => {
			const fromAssetEvents = timelineEvents.find(
				(event) => event.type === type && event.category_id != null,
			)?.category_id;
			if (fromAssetEvents != null) {
				return fromAssetEvents;
			}

			const matchingCategories = eventCategories
				.filter((category) => category.type === type)
				.sort((left, right) => left.id - right.id);

			if (matchingCategories.length === 0) {
				return undefined;
			}

			return matchingCategories[0]?.id;
		};

		return {
			acquisition: resolveByType("acquisition"),
			mortality: resolveByType("mortality"),
		};
	}, [timelineEvents, eventCategories]);

	useEffect(() => {
		hasAutoLoadedEventsPageRef.current = false;
	}, [unitId, selectedEventType]);

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

	const countCardValue = useMemo(() => {
		if (asset?.mode === "aggregated") {
			return String(aggregatedActiveCount);
		}
		return `${allIndividuals.length}`;
	}, [asset?.mode, aggregatedActiveCount, allIndividuals.length]);

	const countCardNote = useMemo(() => {
		if (asset?.mode === "aggregated") {
			return "Entradas por adquisicion menos salidas por mortalidad";
		}
		return "Conteo actual de individuos activos en este lote";
	}, [asset?.mode]);

	const hasDescription = Boolean(asset?.description?.trim());

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

	const handleSelectIndividual = useCallback(
		(individual: ILivestockIndividual) => {
			navigate({
				to: "/v2/production-units/flock/$unitId/individuals/$individualId",
				params: { unitId, individualId: String(individual.id) },
				search: { eventType: selectedEventType },
			});
		},
		[navigate, unitId, selectedEventType],
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
					const eventPairPrefix = buildEventPairIdempotencyPrefix(data.type);
					await createEventMutation.mutateAsync({
						farmId,
						assetId: unitId,
						data: {
							type: data.type,
							occurred_at: data.occurredAt,
							amount: data.amount ?? 0,
							currency: data.currency ?? "USD",
							category_id: data.categoryId,
							individual_id: data.individualId,
							notes: data.notes,
							payload: { status: data.status },
							idempotency_key: `${eventPairPrefix}:${data.type}`,
						},
					});

					if (
						asset.mode === "aggregated" &&
						data.inventoryQuantityDelta != null &&
						data.inventoryQuantityDelta !== 0
					) {
						const inventoryEventType =
							data.type === "expense" ? "acquisition" : "mortality";
						const secondaryCategoryId =
							preferredSecondaryCategoryByType[inventoryEventType];
						const chainReason =
							data.type === "expense"
								? "purchase_inventory_adjustment"
								: "sale_inventory_adjustment";
						await createEventMutation.mutateAsync({
							farmId,
							assetId: unitId,
							data: {
								type: inventoryEventType,
								occurred_at: data.occurredAt,
								category_id: secondaryCategoryId,
								quantity: Math.abs(data.inventoryQuantityDelta),
								notes: data.notes,
								payload: {
									status: data.status,
									paired_with: data.type,
									chain_reason: chainReason,
									chain_role: "inventory_leg",
								},
								idempotency_key: `${eventPairPrefix}:${inventoryEventType}`,
							},
						});
					}
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
				} else if (data.type === "acquisition") {
					const shouldCreateExpensePair = (data.amount ?? 0) > 0;

					if (shouldCreateExpensePair) {
						const eventPairPrefix =
							buildEventPairIdempotencyPrefix("acquisition");
						await createEventMutation.mutateAsync({
							farmId,
							assetId: unitId,
							data: {
								type: "acquisition",
								occurred_at: data.occurredAt,
								category_id: data.categoryId,
								individual_id: data.individualId,
								quantity: data.quantity ?? 0,
								amount: data.amount,
								currency: data.currency,
								notes: data.notes,
								payload: { status: data.status },
								idempotency_key: `${eventPairPrefix}:acquisition`,
							},
						});

						await createEventMutation.mutateAsync({
							farmId,
							assetId: unitId,
							data: {
								type: "expense",
								occurred_at: data.occurredAt,
								amount: data.amount ?? 0,
								currency: data.currency ?? "USD",
								category_id: data.categoryId,
								individual_id: data.individualId,
								notes: data.notes,
								payload: {
									status: data.status,
									paired_with: "acquisition",
									chain_reason: "acquisition_cost",
									chain_role: "financial_leg",
								},
								idempotency_key: `${eventPairPrefix}:expense`,
							},
						});
					} else {
						await createEventMutation.mutateAsync({
							farmId,
							assetId: unitId,
							data: {
								type: "acquisition",
								occurred_at: data.occurredAt,
								category_id: data.categoryId,
								individual_id: data.individualId,
								quantity: data.quantity ?? 0,
								amount: data.amount,
								currency: data.currency,
								notes: data.notes,
								payload: { status: data.status },
							},
						});
					}
				} else if (data.type === "mortality") {
					await createEventMutation.mutateAsync({
						farmId,
						assetId: unitId,
						data: {
							type: "mortality",
							occurred_at: data.occurredAt,
							category_id: data.categoryId,
							individual_id: data.individualId,
							quantity: data.quantity ?? 0,
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
		[
			farmId,
			unitId,
			createEventMutation,
			preferredSecondaryCategoryByType,
			asset,
		],
	);

	const handleStartEditEvent = useCallback((event: ILivestockEvent) => {
		if (isChainedLegEvent(event)) {
			alert(
				"Este evento fue generado automaticamente por una operacion encadenada. Edita el evento financiero principal para mantener consistencia.",
			);
			return;
		}

		setEditingEvent(event);
		setIsCreatingEvent(true);
	}, []);

	const handleDeleteEvent = useCallback(
		async (event: ILivestockEvent) => {
			if (!farmId || !unitId) return;
			if (isChainedLegEvent(event)) {
				alert(
					"Este evento fue generado automaticamente por una operacion encadenada. Eliminalo desde el evento financiero principal para evitar desbalances.",
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
			if (isChainedLegEvent(editingEvent)) {
				alert(
					"Este evento fue generado automaticamente por una operacion encadenada. Edita el evento financiero principal para mantener consistencia.",
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
							editingEvent.type === "mortality"
								? (data.quantity ?? null)
								: null,
						unit:
							editingEvent.type === "production" ||
							editingEvent.type === "observation" ||
							editingEvent.type === "acquisition"
								? (data.unit ?? null)
								: null,
						amount:
							editingEvent.type === "income" ||
							editingEvent.type === "expense" ||
							editingEvent.type === "acquisition"
								? (data.amount ?? null)
								: null,
						currency:
							editingEvent.type === "income" ||
							editingEvent.type === "expense" ||
							editingEvent.type === "acquisition"
								? (data.currency ?? null)
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

	const resetSwipeTracking = useCallback(() => {
		swipeStartXRef.current = null;
		swipeStartYRef.current = null;
		isSwipeCandidateRef.current = false;
	}, []);

	const handleSwipeBack = useCallback(() => {
		navigate({ to: "/v2/production-units", replace: true });
	}, [navigate]);

	const handleTouchStart = useCallback(
		(event: React.TouchEvent<HTMLElement>) => {
			if (event.touches.length !== 1) {
				resetSwipeTracking();
				return;
			}

			const touch = event.touches[0];
			swipeStartXRef.current = touch.clientX;
			swipeStartYRef.current = touch.clientY;
			isSwipeCandidateRef.current = touch.clientX <= 32;
		},
		[resetSwipeTracking],
	);

	const handleTouchEnd = useCallback(
		(event: React.TouchEvent<HTMLElement>) => {
			const startX = swipeStartXRef.current;
			const startY = swipeStartYRef.current;
			const touch = event.changedTouches[0];

			if (
				!isSwipeCandidateRef.current ||
				!touch ||
				startX == null ||
				startY == null
			) {
				resetSwipeTracking();
				return;
			}

			const deltaX = touch.clientX - startX;
			const deltaY = Math.abs(touch.clientY - startY);
			const isValidSwipe =
				deltaX >= 72 && deltaY <= 48 && deltaX > deltaY * 1.5;

			if (isValidSwipe) {
				handleSwipeBack();
			}

			resetSwipeTracking();
		},
		[handleSwipeBack, resetSwipeTracking],
	);

	const handleTouchMove = useCallback(
		(event: React.TouchEvent<HTMLElement>) => {
			const startX = swipeStartXRef.current;
			const startY = swipeStartYRef.current;
			const touch = event.touches[0];

			if (
				!isSwipeCandidateRef.current ||
				!touch ||
				startX == null ||
				startY == null
			) {
				return;
			}

			const deltaX = touch.clientX - startX;
			const deltaY = Math.abs(touch.clientY - startY);
			const isHorizontalEdgeSwipe = deltaX > 12 && deltaX > deltaY;

			if (isHorizontalEdgeSwipe && event.nativeEvent.cancelable) {
				event.preventDefault();
			}
		},
		[],
	);

	if (!farmId) {
		return (
			<section
				className="space-y-4"
				onTouchStart={handleTouchStart}
				onTouchMove={handleTouchMove}
				onTouchEnd={handleTouchEnd}
				onTouchCancel={resetSwipeTracking}
			>
				<div className="v2-card p-5">
					<p className="v2-kicker">Lotes</p>
					<h1 className="mt-2 text-xl font-semibold">Selecciona una granja</h1>
					<p className="mt-1 text-sm text-[color:var(--v2-ink-soft)]">
						No hay granja activa para cargar datos reales.
					</p>
				</div>
			</section>
		);
	}

	if (hasValidAssetId && !asset && isAssetFetching) {
		return (
			<section
				className="space-y-4"
				onTouchStart={handleTouchStart}
				onTouchMove={handleTouchMove}
				onTouchEnd={handleTouchEnd}
				onTouchCancel={resetSwipeTracking}
			>
				<div className="v2-card p-5">
					<p className="text-sm text-[color:var(--v2-ink-soft)]">
						Cargando lote...
					</p>
				</div>
			</section>
		);
	}

	if (!asset) {
		return (
			<section
				className="space-y-4"
				onTouchStart={handleTouchStart}
				onTouchMove={handleTouchMove}
				onTouchEnd={handleTouchEnd}
				onTouchCancel={resetSwipeTracking}
			>
				<div className="v2-card p-5">
					<p className="v2-kicker">Lotes</p>
					<h1 className="mt-2 text-xl font-semibold">Lote no encontrado</h1>
					<p className="mt-1 text-sm text-[color:var(--v2-ink-soft)]">
						No encontramos el lote solicitado.
					</p>
					<Link
						to="/v2/production-units"
						className="mt-4 inline-flex rounded-full border border-[color:var(--v2-ink)] px-3 py-1.5 text-xs font-semibold"
					>
						Volver a ganado
					</Link>
				</div>
			</section>
		);
	}

	return (
		<section
			className="space-y-4"
			onTouchStart={handleTouchStart}
			onTouchMove={handleTouchMove}
			onTouchEnd={handleTouchEnd}
			onTouchCancel={resetSwipeTracking}
		>
			<div className="v2-card p-5">
				<div className="min-w-0 flex-1">
					<div className="mb-2 flex items-center justify-between gap-3">
						<div className="flex items-center gap-2">
							<span className="rounded-md bg-[#e7d7ae] px-2.5 py-1 text-xs font-semibold text-[#6f5413]">
								{toKindLabel(asset)}
							</span>
							<span className="rounded-md border border-[color:var(--v2-border)] bg-white px-2.5 py-1 text-xs font-semibold text-[color:var(--v2-ink)]">
								{toModeLabel(asset)}
							</span>
						</div>
						<Link
							to="/v2/production-units"
							className="inline-flex items-center justify-center p-1 text-[color:var(--v2-ink-soft)] transition-colors hover:text-[color:var(--v2-ink)]"
							aria-label="Volver a ganado"
						>
							<ArrowLeft
								aria-hidden="true"
								className="h-6 w-6"
							/>
						</Link>
					</div>
					<div className="flex items-center gap-2">
						<h1
							className="text-3xl font-bold leading-tight md:text-[2.35rem]"
							style={{ color: "#006847", fontFamily: "var(--v2-font-display)" }}
						>
							{asset.name}
						</h1>
					</div>
					<div className="mt-3 inline-flex max-w-full items-center gap-2 rounded-xl border border-[color:var(--v2-border)] bg-[#ecf0e8] px-3 py-1.5 text-sm text-[color:var(--v2-ink)]">
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
							<div className="mt-4 border-t border-[color:var(--v2-border)]" />
							<div className="mt-4 flex justify-center">
								<blockquote
									className="max-w-2xl text-center text-lg italic leading-snug text-[color:var(--v2-primary)] md:text-xl"
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

			{productionSeries.length > 0 ? (
				<div className="grid gap-3">
					<ProductionSeriesSlider series={productionSeries} />
				</div>
			) : null}

			<div className="grid gap-3 md:grid-cols-2">
				{asset.mode === "aggregated" ? (
					<MetricCard
						label="Conteo"
						value={countCardValue}
						note={countCardNote}
					/>
				) : null}
				<MetricCard
					label="Neto · mes"
					value={formatMoney(netMonth)}
					note="Calculado con eventos de ingreso y gasto del mes"
				/>
			</div>

			<div className="v2-card p-4">
				<div className="mb-3 flex items-center justify-between gap-3">
					<div className="flex items-center gap-2">
						<p className="v2-kicker">Eventos del lote</p>
						<select
							value={selectedEventType ?? "all"}
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
							{EVENT_TYPE_FILTER_OPTIONS.map((option) => (
								<option
									key={option.value}
									value={option.value}
								>
									{option.label}
								</option>
							))}
						</select>
					</div>
					<button
						type="button"
						onClick={() => {
							setIsCreatingEvent((previous) => {
								const next = !previous;
								if (!next) setEditingEvent(null);
								return next;
							});
						}}
						className="inline-flex items-center gap-2 rounded-full border border-[color:var(--v2-ink)] px-3 py-1 text-xs font-semibold"
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
				</div>

				{isCreatingEvent ? (
					<div className="mb-4 rounded-xl border border-[color:var(--v2-border)] bg-white p-3">
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
											currency: editingEvent.currency ?? undefined,
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
						events={timelineEvents}
						categories={eventCategories}
						onEditEvent={handleStartEditEvent}
						onDeleteEvent={handleDeleteEvent}
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

			{asset.mode !== "aggregated" ? (
				<div className="rounded-lg border border-gray-200 bg-white p-6">
					{isCreatingIndividual ? (
						<div>
							<h3 className="mb-4 text-lg font-bold">Agregar individuo</h3>
							<IndividualForm
								availableParents={allIndividuals}
								onSubmit={handleCreateIndividual}
								onCancel={() => setIsCreatingIndividual(false)}
								isLoading={isLoadingIndividuals}
							/>
						</div>
					) : (
						<IndividualList
							individuals={listedIndividuals}
							totalIndividuals={listedIndividualsResponse?.meta.total}
							searchQuery={individualSearchQuery}
							onSearchQueryChange={setIndividualSearchQuery}
							isLoading={isLoadingListedIndividuals}
							onSelectIndividual={handleSelectIndividual}
							onEditIndividual={(individual) =>
								navigate({
									to: "/v2/production-units/flock/$unitId/individuals/$individualId",
									params: { unitId, individualId: String(individual.id) },
									search: { eventType: selectedEventType },
								})
							}
							onDeleteIndividual={handleDeleteIndividual}
							onCreateIndividual={() => setIsCreatingIndividual(true)}
						/>
					)}
				</div>
			) : null}
		</section>
	);
}
