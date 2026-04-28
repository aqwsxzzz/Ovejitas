import { Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";

import { useGetUserProfile } from "@/features/auth/api/auth-queries";
import {
	createEventCategoryByFarmId,
	createEventByAssetId,
	createIndividual as apiCreateIndividual,
	deleteEventByAssetId,
	deleteIndividual as apiDeleteIndividual,
	updateEventByAssetId,
} from "@/features/livestock/api/livestock-api";
import {
	useGetLivestockAssetById,
	useListEventCategoriesByFarmId,
	useListEventsByAssetId,
	useListIndividualsByAssetId,
} from "@/features/livestock/api/livestock-queries";
import type {
	ILivestockAsset,
	ILivestockEvent,
	ILivestockIndividual,
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

function Bars({ data }: { data: number[] }) {
	const max = Math.max(...data, 1);
	return (
		<div className="mt-3 flex h-10 items-end gap-1.5">
			{data.map((value, index) => (
				<div
					key={`${value}-${index}`}
					className={`flex-1 rounded-t-sm border border-black/20 ${
						index === data.length - 1
							? "bg-[#f2df77]"
							: index % 2 === 0
								? "bg-[#1f211d]"
								: "bg-[#8a8677]"
					}`}
					style={{ height: `${Math.max((value / max) * 100, 20)}%` }}
				/>
			))}
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
}

interface ProductionProductSeries {
	productKey: string;
	productLabel: string;
	firstDayLabel: string;
	totalLast7Days: number;
	todayCount: number;
	series: number[];
}

function parseNumeric(value: string | null): number {
	if (!value) return 0;
	const parsed = Number(value);
	return Number.isFinite(parsed) ? parsed : 0;
}

function toBreedLabel(asset: ILivestockAsset): string {
	const modeLabel = asset.mode === "aggregated" ? "aggregate" : "individual";
	return `${asset.kind} · ${modeLabel}`;
}

function buildEventPairIdempotencyPrefix(type: "income" | "expense"): string {
	return `${type}-${crypto.randomUUID()}`;
}

export function FlockDetailPage({ unitId }: FlockDetailPageProps) {
	const navigate = useNavigate();
	const { data: currentUser } = useGetUserProfile();
	const parsedAssetId = Number(unitId);
	const hasValidAssetId = Number.isInteger(parsedAssetId);
	const farmId = currentUser?.lastVisitedFarmId ?? "";

	const [isCreatingIndividual, setIsCreatingIndividual] = useState(false);
	const [isCreatingEvent, setIsCreatingEvent] = useState(false);
	const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
	const [individualSearchQuery, setIndividualSearchQuery] = useState("");
	const [isSavingEvent, setIsSavingEvent] = useState(false);
	const [editingEvent, setEditingEvent] = useState<ILivestockEvent | null>(
		null,
	);
	const [deletingEventId, setDeletingEventId] = useState<number | null>(null);

	const { data: asset, isFetching: isAssetFetching } = useGetLivestockAssetById(
		{
			farmId,
			assetId: parsedAssetId,
			enabled: hasValidAssetId && !!farmId,
		},
	);

	const {
		data: individualsResponse,
		isLoading: isLoadingIndividuals,
		refetch: refetchIndividuals,
	} = useListIndividualsByAssetId({
		farmId,
		assetId: unitId,
		filters: { pageSize: 100 },
		enabled: !!farmId && !!unitId,
	});

	const {
		data: listedIndividualsResponse,
		isLoading: isLoadingListedIndividuals,
		refetch: refetchListedIndividuals,
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

	const { data: eventCategories = [], refetch: refetchEventCategories } =
		useListEventCategoriesByFarmId({
			farmId,
			filters: { archived: false, pageSize: 100 },
			enabled: !!farmId,
		});

	const {
		data: eventsResponse,
		isLoading: isLoadingEvents,
		refetch: refetchEvents,
	} = useListEventsByAssetId({
		farmId,
		assetId: unitId,
		filters: { pageSize: 100, sort: "-occurred_at" },
		enabled: !!farmId && !!unitId,
	});

	const allIndividuals = individualsResponse?.data ?? [];
	const listedIndividuals = listedIndividualsResponse?.data ?? [];
	const unitEvents = useMemo(
		() => eventsResponse?.data ?? [],
		[eventsResponse],
	);

	const productionSeries = useMemo<ProductionProductSeries[]>(() => {
		const today = new Date();
		const days = Array.from({ length: 7 }, (_, index) => {
			const d = new Date(today);
			d.setHours(0, 0, 0, 0);
			d.setDate(today.getDate() - (6 - index));
			return d;
		});
		const dayKeys = days.map((d) => d.toISOString().slice(0, 10));
		const firstDayLabel = days[0]?.toLocaleDateString("es-EC", {
			weekday: "short",
		});
		const categoryNameById = new Map(
			eventCategories.map((category) => [category.id, category.name]),
		);
		const totalsByProduct = new Map<string, Map<string, number>>();

		for (const event of unitEvents) {
			if (event.type !== "production") continue;
			const key = event.occurred_at.slice(0, 10);
			if (!dayKeys.includes(key)) continue;

			const productKey =
				event.category_id != null ? String(event.category_id) : "uncategorized";
			if (!totalsByProduct.has(productKey)) {
				totalsByProduct.set(
					productKey,
					new Map(dayKeys.map((dayKey) => [dayKey, 0])),
				);
			}

			const productTotals = totalsByProduct.get(productKey);
			if (!productTotals) continue;

			productTotals.set(
				key,
				(productTotals.get(key) ?? 0) + parseNumeric(event.quantity),
			);
		}

		return Array.from(totalsByProduct.entries())
			.map(([productKey, totalsByDay]) => {
				const series = dayKeys.map((dayKey) => totalsByDay.get(dayKey) ?? 0);
				const totalLast7Days = series.reduce((sum, value) => sum + value, 0);
				const todayCount = series[series.length - 1] ?? 0;
				const productLabel =
					productKey === "uncategorized"
						? "Sin categoria"
						: (categoryNameById.get(Number(productKey)) ??
							`Categoria #${productKey}`);

				return {
					productKey,
					productLabel,
					firstDayLabel: firstDayLabel ?? "",
					totalLast7Days,
					todayCount,
					series,
				};
			})
			.sort((left, right) => right.totalLast7Days - left.totalLast7Days);
	}, [unitEvents, eventCategories]);

	const netMonth = useMemo(() => {
		const now = new Date();
		const currentMonth = now.getMonth();
		const currentYear = now.getFullYear();

		return unitEvents.reduce((acc, event) => {
			const occurredAt = new Date(event.occurred_at);
			if (
				occurredAt.getMonth() !== currentMonth ||
				occurredAt.getFullYear() !== currentYear
			) {
				return acc;
			}
			if (event.type === "income") return acc + parseNumeric(event.amount);
			if (event.type === "expense") return acc - parseNumeric(event.amount);
			return acc;
		}, 0);
	}, [unitEvents]);

	const aggregatedBalance = useMemo(() => {
		return unitEvents.reduce((acc, event) => {
			if (event.quantity == null) return acc;
			if (event.type === "acquisition")
				return acc + parseNumeric(event.quantity);
			if (event.type === "mortality") return acc - parseNumeric(event.quantity);
			return acc;
		}, 0);
	}, [unitEvents]);

	const aggregatedAcquiredTotal = useMemo(() => {
		return unitEvents.reduce((acc, event) => {
			if (event.type !== "acquisition" || event.quantity == null) return acc;
			return acc + parseNumeric(event.quantity);
		}, 0);
	}, [unitEvents]);

	const taggedMembersCount = useMemo(
		() =>
			allIndividuals.filter((individual) =>
				Boolean(individual.tag && individual.tag.trim()),
			).length,
		[allIndividuals],
	);

	const countSummary = useMemo(() => {
		if (asset?.mode === "individual") {
			return `${taggedMembersCount} individuos etiquetados`;
		}
		if (asset?.mode === "aggregated") {
			return unitEvents.some(
				(event) =>
					(event.type === "acquisition" || event.type === "mortality") &&
					event.quantity != null,
			)
				? `${aggregatedBalance} en conteo neto`
				: "sin conteo registrado";
		}
		return "";
	}, [asset?.mode, taggedMembersCount, aggregatedBalance, unitEvents]);

	const countCardValue = useMemo(() => {
		if (asset?.mode === "aggregated") {
			return `${aggregatedBalance} / ${aggregatedAcquiredTotal}`;
		}
		return `${allIndividuals.length} / ${allIndividuals.length}`;
	}, [
		asset?.mode,
		aggregatedBalance,
		aggregatedAcquiredTotal,
		allIndividuals.length,
	]);

	const countCardNote = useMemo(() => {
		if (asset?.mode === "aggregated") {
			return "Conteo neto (adquisiciones - mortalidades) / total adquirido";
		}
		return "Conteo actual de individuos activos en este lote";
	}, [asset?.mode]);

	const hasDescription = Boolean(asset?.description?.trim());
	const descriptionPreview = useMemo(() => {
		const raw = asset?.description?.trim() ?? "";
		if (raw.length <= 140) return raw;
		return `${raw.slice(0, 140)}...`;
	}, [asset?.description]);

	const handleCreateIndividual = useCallback(
		async (data: IndividualFormData) => {
			if (!farmId || !unitId) return;

			await apiCreateIndividual({
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
			await refetchIndividuals();
			await refetchListedIndividuals();
		},
		[farmId, unitId, refetchIndividuals, refetchListedIndividuals],
	);

	const handleDeleteIndividual = useCallback(
		async (individual: ILivestockIndividual) => {
			if (!farmId || !unitId) return;

			await apiDeleteIndividual({
				farmId,
				assetId: unitId,
				individualId: String(individual.id),
			});

			await refetchIndividuals();
			await refetchListedIndividuals();
		},
		[farmId, unitId, refetchIndividuals, refetchListedIndividuals],
	);

	const handleSelectIndividual = useCallback(
		(individual: ILivestockIndividual) => {
			navigate({
				to: "/v2/production-units/flock/$unitId/individuals/$individualId",
				params: { unitId, individualId: String(individual.id) },
			});
		},
		[navigate, unitId],
	);

	const handleCreateEvent = useCallback(
		async (data: UnitEventFormData) => {
			if (!farmId || !unitId || !asset) return;
			if (data.type === "reproductive" && data.individualId == null) return;

			setIsSavingEvent(true);
			try {
				if (data.type === "production") {
					await createEventByAssetId({
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
					await createEventByAssetId({
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
						await createEventByAssetId({
							farmId,
							assetId: unitId,
							data: {
								type: "observation",
								occurred_at: data.occurredAt,
								quantity: data.inventoryQuantityDelta,
								unit: data.inventoryUnit ?? "unit",
								notes: data.notes,
								payload: {
									status: data.status,
									paired_with: data.type,
								},
								idempotency_key: `${eventPairPrefix}:observation`,
							},
						});
					}
				} else if (data.type === "observation") {
					await createEventByAssetId({
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
					await createEventByAssetId({
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
				} else if (data.type === "mortality") {
					await createEventByAssetId({
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
					await createEventByAssetId({
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
				await refetchEvents();
			} finally {
				setIsSavingEvent(false);
			}
		},
		[farmId, unitId, refetchEvents, asset],
	);

	const handleStartEditEvent = useCallback((event: ILivestockEvent) => {
		setEditingEvent(event);
		setIsCreatingEvent(true);
	}, []);

	const handleDeleteEvent = useCallback(
		async (event: ILivestockEvent) => {
			if (!farmId || !unitId) return;
			if (!confirm("Eliminar este evento?")) return;

			setDeletingEventId(event.id);
			try {
				await deleteEventByAssetId({
					farmId,
					assetId: unitId,
					eventId: event.id,
				});

				if (editingEvent?.id === event.id) {
					setEditingEvent(null);
					setIsCreatingEvent(false);
				}

				await refetchEvents();
			} finally {
				setDeletingEventId(null);
			}
		},
		[farmId, unitId, editingEvent, refetchEvents],
	);

	const handleSubmitEvent = useCallback(
		async (data: UnitEventFormData) => {
			if (!editingEvent) {
				await handleCreateEvent(data);
				return;
			}
			if (!farmId || !unitId || !asset) return;

			setIsSavingEvent(true);
			try {
				const nextIndividualId =
					asset.mode === "individual" ? (data.individualId ?? null) : null;
				await updateEventByAssetId({
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
							editingEvent.type === "observation"
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
				await refetchEvents();
			} finally {
				setIsSavingEvent(false);
			}
		},
		[editingEvent, handleCreateEvent, farmId, unitId, refetchEvents, asset],
	);

	const handleCreateProductionCategory = useCallback(
		async ({ name, color }: { name: string; color?: string }) => {
			if (!farmId) {
				throw new Error("Farm id is required to create categories.");
			}

			const createdCategory = await createEventCategoryByFarmId({
				farmId,
				data: {
					type: "production",
					name,
					color,
				},
			});

			await refetchEventCategories();
			return createdCategory.id;
		},
		[farmId, refetchEventCategories],
	);

	if (!farmId) {
		return (
			<section className="space-y-4">
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
			<section className="space-y-4">
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
			<section className="space-y-4">
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
		<section className="space-y-4">
			<div className="v2-card p-5">
				<div className="flex items-start justify-between gap-3">
					<div>
						<div className="flex items-center gap-2">
							<Link
								to="/v2/production-units"
								className="text-sm text-[color:var(--v2-ink-soft)]"
							>
								‹
							</Link>
							<h1 className="text-2xl font-semibold">{asset.name}</h1>
						</div>
						<p className="mt-2 text-sm italic text-[color:var(--v2-ink-soft)]">
							{toBreedLabel(asset)} · {countSummary} ·{" "}
							{asset.location ?? "Sin ubicacion"}
						</p>
						{hasDescription ? (
							<div className="mt-3 rounded-lg border border-(--v2-border) bg-(--v2-surface) px-3 py-2">
								<p className="text-xs font-medium uppercase tracking-[0.08em] text-(--v2-ink-soft)">
									Descripcion
								</p>
								<p className="mt-1 text-sm leading-relaxed text-(--v2-ink-soft) wrap-break-word">
									{isDescriptionExpanded
										? asset.description
										: descriptionPreview}
								</p>
								{asset.description && asset.description.trim().length > 140 ? (
									<button
										type="button"
										onClick={() => setIsDescriptionExpanded((value) => !value)}
										className="mt-1 text-xs font-semibold text-(--v2-ink)"
									>
										{isDescriptionExpanded ? "Ver menos" : "Ver completa"}
									</button>
								) : null}
							</div>
						) : null}
					</div>
					<span className="text-[color:var(--v2-ink-soft)]">···</span>
				</div>
			</div>

			{productionSeries.length > 0 ? (
				<div className="grid gap-3">
					{productionSeries.map((productSeries) => (
						<div
							key={productSeries.productKey}
							className="rounded-2xl border border-black/20 bg-[#f2df77] p-4 shadow-[0_10px_24px_-18px_rgba(0,0,0,0.45)]"
						>
							<p className="text-[10px] uppercase tracking-[0.08em] text-(--v2-ink-soft)">
								{productSeries.productLabel} · ultimos 7 dias
							</p>
							<div className="mt-2 flex items-start justify-between gap-3">
								<p className="text-5xl font-semibold leading-none">
									{productSeries.totalLast7Days}
								</p>
								<div className="text-right text-sm text-(--v2-ink-soft)">
									<p className="text-xs uppercase tracking-[0.08em]">Hoy</p>
									<p className="text-xl font-semibold leading-none text-(--v2-ink)">
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
							/>
							<div className="mt-2 flex items-center justify-between text-[11px] uppercase tracking-[0.08em] text-(--v2-ink-soft)">
								<span>{productSeries.firstDayLabel}</span>
								<span>Hoy · {productSeries.todayCount}</span>
							</div>
						</div>
					))}
				</div>
			) : null}

			<div className="grid gap-3 md:grid-cols-2">
				<MetricCard
					label="Conteo"
					value={countCardValue}
					note={countCardNote}
				/>
				<MetricCard
					label="Neto · mes"
					value={formatMoney(netMonth)}
					note="Calculado con eventos de ingreso y gasto del mes"
				/>
			</div>

			<div className="v2-card p-4">
				<div className="mb-3 flex items-center justify-between gap-3">
					<p className="v2-kicker">Eventos del lote</p>
					<button
						type="button"
						onClick={() => {
							setIsCreatingEvent((previous) => {
								const next = !previous;
								if (!next) setEditingEvent(null);
								return next;
							});
						}}
						className="rounded-full border border-[color:var(--v2-ink)] px-3 py-1 text-xs font-semibold"
					>
						{isCreatingEvent ? "Cerrar" : "Nuevo evento"}
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
							onCreateProductionCategory={handleCreateProductionCategory}
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

				<UnitEventTimeline
					events={unitEvents}
					categories={eventCategories}
					onEditEvent={handleStartEditEvent}
					onDeleteEvent={handleDeleteEvent}
					deletingEventId={deletingEventId}
					editingEventId={editingEvent?.id ?? null}
				/>
				{isLoadingEvents ? (
					<p className="mt-2 text-xs text-[color:var(--v2-ink-soft)]">
						Actualizando eventos...
					</p>
				) : null}
			</div>

			<div className="rounded-lg border border-gray-200 bg-white p-6">
				{asset?.mode === "aggregated" ? (
					<div className="text-sm text-(--v2-ink-soft)">
						Este lote es agrupado. Los individuos solo se pueden crear en lotes
						de modo individual.
					</div>
				) : isCreatingIndividual ? (
					<div>
						<h3 className="mb-4 text-lg font-bold">Add Individual</h3>
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
						searchQuery={individualSearchQuery}
						onSearchQueryChange={setIndividualSearchQuery}
						isLoading={isLoadingListedIndividuals}
						onSelectIndividual={handleSelectIndividual}
						onEditIndividual={(individual) =>
							navigate({
								to: "/v2/production-units/flock/$unitId/individuals/$individualId",
								params: { unitId, individualId: String(individual.id) },
							})
						}
						onDeleteIndividual={handleDeleteIndividual}
						onCreateIndividual={() => setIsCreatingIndividual(true)}
					/>
				)}
			</div>
		</section>
	);
}
