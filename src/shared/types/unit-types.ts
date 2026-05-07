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
