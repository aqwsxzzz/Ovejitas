export type UnitMode = "aggregate" | "individual";

export type AssetKind =
	| "animal"
	| "crop"
	| "equipment"
	| "material"
	| "location";

export type EventType =
	| "production"
	| "expense"
	| "income"
	| "health"
	| "reproductive"
	| "feed";

export type EventStatus = "planned" | "logged";

export interface FarmWorkspace {
	id: string;
	name: string;
	timezone: string;
	currency: string;
}

export interface ProductionUnit {
	id: string;
	farmId: string;
	name: string;
	categoryLabel: string;
	kind: AssetKind;
	mode: UnitMode;
	status: "active" | "inactive";
	location?: string;
	tags: string[];
	/** For aggregate-mode units: total animal count */
	headCount?: number;
	/** Change in headCount over the past 7 days (signed integer) */
	headCountChange?: number;
}

export interface Individual {
	id: string;
	unitId: string;
	name: string;
	tag: string;
	sex?: "male" | "female" | "unknown";
	birthDate?: string;
	status: "active" | "sold" | "deceased";
	parentId?: string;
	motherId?: string;
	fatherId?: string;
	attributes?: Record<string, string | number | boolean>;
}

export interface EventCategory {
	id: string;
	farmId: string;
	type: EventType;
	name: string;
	unit?: string;
	color?: string;
}

export interface FarmEvent {
	id: string;
	farmId: string;
	unitId: string;
	individualId?: string;
	type: EventType;
	categoryId: string;
	occurredAt: string;
	status: EventStatus;
	quantity?: number;
	amount?: number;
	notes?: string;
	metadata?: Record<string, string | number | boolean>;
}

export interface InventoryItem {
	id: string;
	farmId: string;
	name: string;
	stock: number;
	stockUnit: string;
	daysOfCover: number;
	reorderThreshold: number;
	status: "ok" | "low" | "critical";
}

export interface DashboardTask {
	id: string;
	title: string;
	dueAt: string;
	priority: "high" | "normal";
	unitName: string;
}

export interface DashboardAlert {
	id: string;
	title: string;
	description: string;
	severity: "urgent" | "warning";
}

export interface DashboardSnapshot {
	farmName: string;
	kpis: {
		autonomyDays: number;
		marginRiskAlerts: number;
		actionsDueToday: number;
	};
	urgentAlerts: DashboardAlert[];
	todayTasks: DashboardTask[];
}

export interface FinanceCategoryTotal {
	categoryName: string;
	total: number;
}

export interface FinanceSummary {
	income: number;
	expense: number;
	net: number;
	costByCategory: FinanceCategoryTotal[];
}

export interface FeedSummary {
	lowestDaysOfCover: number;
	lowStockItems: InventoryItem[];
}

export interface EventCreatePayload {
	farmId: string;
	unitId: string;
	individualId?: string;
	type: EventType;
	categoryId: string;
	occurredAt: string;
	status?: EventStatus;
	quantity?: number;
	amount?: number;
	notes?: string;
	metadata?: Record<string, string | number | boolean>;
}

/** One of the four cells in a production unit's dashboard card */
export interface UnitKpiCard {
	label: string;
	/** Primary value displayed large */
	value: string;
	/** Supporting detail line (e.g. "$1.5k in · $0.9k out") */
	sub?: string;
	/** If present, renders an inline sparkline (values oldest → newest) */
	sparkline?: number[];
	/** If present, renders a fill bar (0 – 1) */
	fillPct?: number;
	status?: "ok" | "low" | "critical";
}

/** Per-unit KPI snapshot shown as one slide in the dashboard slider */
export interface UnitDashboardSlice {
	unitId: string;
	unitName: string;
	categoryLabel: string;
	mode: UnitMode;
	status: "active" | "inactive";
	/** Always exactly 4 cells: animals · primary · finance · feed */
	kpis: [UnitKpiCard, UnitKpiCard, UnitKpiCard, UnitKpiCard];
}

/** Flat individual enriched with attention state for the Livestock list */
export interface LivestockIndividual {
	id: string;
	name: string;
	tag: string;
	sex?: "male" | "female" | "unknown";
	categoryKey: string;
	categoryLabel: string;
	icon: string;
	unitId: string;
	attention?: "overdue" | "watch";
	attentionNote?: string;
}

/** One species / category group shown in the livestock accordion */
export interface LivestockGroup {
	categoryKey: string;
	mode: UnitMode;
	title: string;
	subtitle: string;
	categoryLabel: string;
	icon: string;
	totalCount: number;
	attentionItems: LivestockIndividual[];
	healthyItems: LivestockIndividual[];
}

export interface FlockRecentEvent {
	id: string;
	dateLabel: string;
	title: string;
	detail?: string;
}

export interface FlockDetailSnapshot {
	unitId: string;
	unitName: string;
	breedLabel: string;
	headCount: number;
	capacity: number;
	location?: string;
	eggsLast7Days: number;
	layRate: number;
	dailyEggSeries: number[];
	todayEggCount: number;
	lossesLabel: string;
	netMonth: number;
	financeNote: string;
	recentEvents: FlockRecentEvent[];
}
