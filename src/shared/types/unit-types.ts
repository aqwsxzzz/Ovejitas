export const EVENT_UNITS = [
	"g",
	"kg",
	"lb",
	"t",
	"ml",
	"l",
	"gal",
	"unit",
	"dozen",
	"head",
] as const;

export type EventUnit = (typeof EVENT_UNITS)[number];

export const EVENT_UNITS_BY_DIMENSION = {
	mass: ["g", "kg", "lb", "t"],
	volume: ["ml", "l", "gal"],
	count: ["unit", "dozen", "head"],
} as const satisfies Record<string, readonly EventUnit[]>;

/** Spanish display labels; metric abbreviations stay as-is. */
export const EVENT_UNIT_LABELS = {
	g: "g",
	kg: "kg",
	lb: "lb",
	t: "t",
	ml: "ml",
	l: "l",
	gal: "gal",
	unit: "unidades",
	dozen: "docenas",
	head: "cabezas",
} as const satisfies Record<EventUnit, string>;
