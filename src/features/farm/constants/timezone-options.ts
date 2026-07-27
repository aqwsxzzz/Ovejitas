/**
 * IANA timezone names for the farm timezone picker. Uses the runtime list when
 * available (all modern browsers) and falls back to a small curated set otherwise.
 * The farm timezone drives produce FIFO basket day-grouping on the backend.
 */
const FALLBACK_TIMEZONES = [
	"UTC",
	"America/Montevideo",
	"America/Argentina/Buenos_Aires",
	"America/Santiago",
	"America/Sao_Paulo",
	"America/Bogota",
	"America/Mexico_City",
	"America/Lima",
	"Europe/Madrid",
] as const;

const intlWithValues = Intl as typeof Intl & {
	supportedValuesOf?: (key: "timeZone") => string[];
};

export const TIMEZONE_OPTIONS: readonly string[] =
	typeof intlWithValues.supportedValuesOf === "function"
		? intlWithValues.supportedValuesOf("timeZone")
		: FALLBACK_TIMEZONES;
