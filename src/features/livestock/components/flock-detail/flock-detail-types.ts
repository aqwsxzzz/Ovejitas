import type {
	ILivestockAsset,
	ILivestockEvent,
	LivestockEventType,
} from "@/features/livestock/types/livestock-types";

export interface FlockDetailPageProps {
	unitId: string;
	eventTypeFilter?: string;
	onEventTypeFilterChange?: (next: LivestockEventType | "all") => void;
}

export interface ProductionProductSeries {
	productKey: string;
	productLabel: string;
	firstDayLabel: string;
	dayLabels: string[];
	totalLast7Days: number;
	todayCount: number;
	series: number[];
}

export type MaterialActionMode = "purchase" | "consumption" | "sale";

export const EVENTS_LOG_PAGE_SIZE = 3;

export const EVENT_TYPE_FILTER_OPTIONS: Array<{
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

export function getEventTypeFilterOptions(
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

export function isLivestockEventType(
	value: string,
): value is LivestockEventType {
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

export function isActionOwnedEvent(event: ILivestockEvent): boolean {
	return typeof event.payload.source === "string";
}
