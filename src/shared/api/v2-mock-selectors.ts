import type {
	DashboardAlert,
	DashboardSnapshot,
	DashboardTask,
	FarmEvent,
	FeedSummary,
	FlockDetailSnapshot,
	FinanceSummary,
	Individual,
	InventoryItem,
	ProductionUnit,
	UnitDashboardSlice,
	UnitKpiCard,
} from "@/shared/types/v2-domain-types";
import type {
	LivestockGroup,
	LivestockIndividual,
} from "@/shared/types/v2-domain-types";

function isSameDay(a: Date, b: Date): boolean {
	return (
		a.getFullYear() === b.getFullYear() &&
		a.getMonth() === b.getMonth() &&
		a.getDate() === b.getDate()
	);
}

function resolveUnitName(units: ProductionUnit[], unitId: string): string {
	return units.find((unit) => unit.id === unitId)?.name ?? "Unidad desconocida";
}

function toSpanishCategoryLabel(label: string): string {
	const translated: Record<string, string> = {
		Sheep: "Ovejas",
		Cattle: "Ganado",
		Goat: "Cabras",
		Pig: "Cerdos",
		Chicken: "Pollos",
	};
	return translated[label] ?? label;
}

export function selectDashboardSnapshot(params: {
	farmName: string;
	units: ProductionUnit[];
	events: FarmEvent[];
	inventory: InventoryItem[];
}): DashboardSnapshot {
	const now = new Date();

	const todayPlanned = params.events.filter((event) => {
		if (event.status !== "planned") return false;
		return isSameDay(new Date(event.occurredAt), now);
	});

	const todayTasks: DashboardTask[] = todayPlanned.map((event) => ({
		id: event.id,
		title: event.notes ?? `Registrar ${event.type}`,
		dueAt: event.occurredAt,
		priority: event.metadata?.priority === "high" ? "high" : "normal",
		unitName: resolveUnitName(params.units, event.unitId),
	}));

	const urgentAlerts: DashboardAlert[] = params.events
		.filter(
			(event) =>
				event.status === "planned" && event.metadata?.alert === "urgent",
		)
		.map((event) => ({
			id: event.id,
			title: event.notes ?? "Accion critica pendiente",
			description: `${resolveUnitName(params.units, event.unitId)} requiere atencion`,
			severity: "urgent",
		}));

	const lowStockCount = params.inventory.filter(
		(item) => item.status !== "ok",
	).length;
	const autonomyDays = Math.min(
		...params.inventory.map((item) => item.daysOfCover),
	);

	return {
		farmName: params.farmName,
		kpis: {
			autonomyDays,
			marginRiskAlerts: lowStockCount,
			actionsDueToday: todayTasks.length,
		},
		urgentAlerts,
		todayTasks,
	};
}

export function selectFinanceSummary(events: FarmEvent[]): FinanceSummary {
	const income = events
		.filter((event) => event.type === "income")
		.reduce((total, event) => total + (event.amount ?? 0), 0);
	const expense = events
		.filter((event) => event.type === "expense")
		.reduce((total, event) => total + (event.amount ?? 0), 0);

	return {
		income,
		expense,
		net: income - expense,
		costByCategory: [
			{ categoryName: "Alimento", total: expense },
			{ categoryName: "Otros", total: 0 },
		],
	};
}

export function selectFeedSummary(inventory: InventoryItem[]): FeedSummary {
	const sorted = [...inventory].sort((a, b) => a.daysOfCover - b.daysOfCover);
	return {
		lowestDaysOfCover: sorted[0]?.daysOfCover ?? 0,
		lowStockItems: sorted.filter((item) => item.status !== "ok"),
	};
}

// ─── Unit dashboard slices (one per production unit for the slider) ───────────

function isThisMonth(date: Date): boolean {
	const now = new Date();
	return (
		date.getFullYear() === now.getFullYear() &&
		date.getMonth() === now.getMonth()
	);
}

function buildProductionSparkline(
	events: FarmEvent[],
	unitId: string,
	days: number,
): number[] {
	const now = new Date();
	const result: number[] = [];
	for (let d = days - 1; d >= 0; d--) {
		const target = new Date(now);
		target.setDate(target.getDate() - d);
		const total = events
			.filter(
				(e) =>
					e.unitId === unitId &&
					e.type === "production" &&
					e.status === "logged" &&
					isSameDay(new Date(e.occurredAt), target),
			)
			.reduce((sum, e) => sum + (e.quantity ?? 0), 0);
		result.push(total);
	}
	return result;
}

function formatAmount(value: number): string {
	if (Math.abs(value) >= 1000) {
		return `$${(value / 1000).toFixed(1)}k`;
	}
	return `$${value}`;
}

export function selectUnitDashboardSlices(params: {
	units: ProductionUnit[];
	individuals: Individual[];
	events: FarmEvent[];
	inventory: InventoryItem[];
}): UnitDashboardSlice[] {
	const now = new Date();

	const lowestInventory = [...params.inventory].sort(
		(a, b) => a.daysOfCover - b.daysOfCover,
	)[0];

	return params.units
		.filter((unit) => unit.status === "active")
		.map((unit): UnitDashboardSlice => {
			// ── KPI 0: Animals ────────────────────────────────────────
			const animalCount =
				unit.mode === "individual"
					? params.individuals.filter(
							(i) => i.unitId === unit.id && i.status === "active",
						).length
					: (unit.headCount ?? 0);
			const animalSub =
				unit.headCountChange != null
					? `${unit.headCountChange >= 0 ? "+" : ""}${unit.headCountChange} esta semana`
					: undefined;
			const animalsKpi: UnitKpiCard = {
				label: "Animales",
				value: String(animalCount),
				sub: animalSub,
			};

			// ── KPI 1: Primary metric ─────────────────────────────────
			const todayProduction = params.events
				.filter(
					(e) =>
						e.unitId === unit.id &&
						e.type === "production" &&
						e.status === "logged" &&
						isSameDay(new Date(e.occurredAt), now),
				)
				.reduce((sum, e) => sum + (e.quantity ?? 0), 0);

			const primaryKpi: UnitKpiCard =
				unit.mode === "aggregate" || unit.tags.includes("eggs")
					? {
							label: "Huevos hoy",
							value: todayProduction > 0 ? String(todayProduction) : "—",
							sparkline: buildProductionSparkline(params.events, unit.id, 7),
						}
					: (() => {
							const pregnant = params.individuals.filter(
								(i) =>
									i.unitId === unit.id &&
									i.attributes?.reproductiveStatus === "pregnant",
							).length;
							return {
								label: pregnant > 0 ? "Prenadas" : "Individuos",
								value: pregnant > 0 ? String(pregnant) : String(animalCount),
								sub: pregnant > 0 ? `${animalCount} activos` : undefined,
							};
						})();

			// ── KPI 2: Finance this month ─────────────────────────────
			const income = params.events
				.filter(
					(e) =>
						e.unitId === unit.id &&
						e.type === "income" &&
						isThisMonth(new Date(e.occurredAt)),
				)
				.reduce((sum, e) => sum + (e.amount ?? 0), 0);
			const expense = params.events
				.filter(
					(e) =>
						e.unitId === unit.id &&
						e.type === "expense" &&
						isThisMonth(new Date(e.occurredAt)),
				)
				.reduce((sum, e) => sum + (e.amount ?? 0), 0);
			const net = income - expense;
			const financeKpi: UnitKpiCard = {
				label: "Neto · ABR",
				value: `${net >= 0 ? "+" : ""}${formatAmount(net)}`,
				sub: `${formatAmount(income)} entrada · ${formatAmount(expense)} salida`,
			};

			// ── KPI 3: Feed stock ─────────────────────────────────────
			const fillPct = lowestInventory
				? Math.min(
						lowestInventory.stock / (lowestInventory.reorderThreshold * 5),
						1,
					)
				: 1;
			const feedKpi: UnitKpiCard = {
				label: "Stock alimento",
				value: lowestInventory
					? `${lowestInventory.stock} ${lowestInventory.stockUnit}`
					: "—",
				fillPct,
				status: lowestInventory?.status ?? "ok",
			};

			return {
				unitId: unit.id,
				unitName: unit.name,
				categoryLabel: toSpanishCategoryLabel(unit.categoryLabel),
				mode: unit.mode,
				status: unit.status,
				kpis: [animalsKpi, primaryKpi, financeKpi, feedKpi],
			};
		});
}

// ─── Livestock groups (accordion list) ───────────────────────────────────────

const CATEGORY_ICONS: Record<string, string> = {
	Sheep: "🐑",
	Cattle: "🐄",
	Goat: "🐐",
	Pig: "🐷",
	Chicken: "🐔",
};

export function selectLivestockGroups(params: {
	units: ProductionUnit[];
	individuals: Individual[];
	events: FarmEvent[];
}): LivestockGroup[] {
	const unitMap = new Map(params.units.map((u) => [u.id, u]));

	const groupMap = new Map<string, LivestockIndividual[]>();

	for (const ind of params.individuals) {
		if (ind.status !== "active") continue;
		const unit = unitMap.get(ind.unitId);
		if (!unit || unit.mode !== "individual") continue;

		const label = unit.categoryLabel;
		const icon = CATEGORY_ICONS[label] ?? "🐾";
		const attention = ind.attributes?.attention as
			| "overdue"
			| "watch"
			| undefined;

		const flat: LivestockIndividual = {
			id: ind.id,
			name: ind.name,
			tag: ind.tag,
			sex: ind.sex,
			categoryKey: label,
			categoryLabel: label,
			icon,
			unitId: ind.unitId,
			attention,
			attentionNote: ind.attributes?.attentionNote as string | undefined,
		};

		const bucket = groupMap.get(label) ?? [];
		bucket.push(flat);
		groupMap.set(label, bucket);
	}

	const individualGroups: LivestockGroup[] = [...groupMap.entries()].map(
		([label, items]) => ({
			categoryKey: label,
			mode: "individual",
			title: toSpanishCategoryLabel(label),
			subtitle: `${items.length} animales`,
			categoryLabel: toSpanishCategoryLabel(label),
			icon: CATEGORY_ICONS[label] ?? "🐾",
			totalCount: items.length,
			attentionItems: items.filter((i) => i.attention != null),
			healthyItems: items.filter((i) => i.attention == null),
		}),
	);

	const groupedUnits: LivestockGroup[] = params.units
		.filter((unit) => unit.status === "active" && unit.mode === "aggregate")
		.map((unit) => {
			const todayProduction = params.events
				.filter(
					(event) =>
						event.unitId === unit.id &&
						event.type === "production" &&
						event.status === "logged" &&
						isSameDay(new Date(event.occurredAt), new Date()),
				)
				.reduce((sum, event) => sum + (event.quantity ?? 0), 0);

			const subtitle = unit.tags.includes("eggs")
				? `${unit.headCount ?? 0} aves · ${todayProduction} huevos hoy`
				: `${unit.headCount ?? 0} aves · ${unit.location ?? "sin ubicacion"}`;

			return {
				categoryKey: unit.id,
				mode: "aggregate",
				title: unit.name,
				subtitle,
				categoryLabel: toSpanishCategoryLabel(unit.categoryLabel),
				icon: CATEGORY_ICONS[unit.categoryLabel] ?? "🐾",
				totalCount: unit.headCount ?? 0,
				attentionItems: [],
				healthyItems: [],
			};
		});

	return [...individualGroups, ...groupedUnits];
}

export function selectFlockDetailSnapshot(params: {
	unit: ProductionUnit;
	events: FarmEvent[];
}): FlockDetailSnapshot {
	const unitEvents = params.events.filter(
		(event) => event.unitId === params.unit.id,
	);
	const dailyEggSeries = buildProductionSparkline(
		params.events,
		params.unit.id,
		7,
	);
	const todayEggCount = dailyEggSeries[dailyEggSeries.length - 1] ?? 0;
	const eggsLast7Days = dailyEggSeries.reduce((sum, value) => sum + value, 0);
	const headCount = params.unit.headCount ?? 0;
	const capacity = Math.max(headCount + 3, headCount);
	const layRate =
		headCount > 0 ? Math.round((todayEggCount / headCount) * 100) : 0;

	const income = unitEvents
		.filter(
			(event) =>
				event.type === "income" && isThisMonth(new Date(event.occurredAt)),
		)
		.reduce((sum, event) => sum + (event.amount ?? 0), 0);
	const expense = unitEvents
		.filter(
			(event) =>
				event.type === "expense" && isThisMonth(new Date(event.occurredAt)),
		)
		.reduce((sum, event) => sum + (event.amount ?? 0), 0);

	const recentEvents = unitEvents
		.filter((event) => event.type !== "production")
		.sort(
			(a, b) =>
				new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
		)
		.slice(0, 2)
		.map((event) => ({
			id: event.id,
			dateLabel: new Date(event.occurredAt).toLocaleDateString("es-EC", {
				month: "short",
				day: "2-digit",
			}),
			title:
				event.type === "expense"
					? "gasto"
					: event.type === "feed"
						? "alimentacion"
						: event.type === "health"
							? "salud"
							: event.type,
			detail: event.notes,
		}));

	return {
		unitId: params.unit.id,
		unitName: params.unit.name,
		breedLabel: params.unit.tags.includes("eggs")
			? "Leghorn"
			: params.unit.categoryLabel,
		headCount,
		capacity,
		location: params.unit.location,
		eggsLast7Days,
		layRate,
		dailyEggSeries,
		todayEggCount,
		lossesLabel:
			headCount < capacity ? `${capacity - headCount} bajas` : "sin bajas",
		netMonth: income - expense,
		financeNote: params.unit.tags.includes("eggs")
			? "ratio alimento 2:1"
			: "seguimiento mensual",
		recentEvents,
	};
}
