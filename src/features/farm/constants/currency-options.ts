export interface CurrencyOption {
	code: string;
	name: string;
}

/**
 * Currency choices for the farm `default_currency`. The v1 backend has no
 * currencies endpoint, so the list is maintained on the frontend.
 */
export const CURRENCY_OPTIONS: CurrencyOption[] = [
	{ code: "USD", name: "Dólar estadounidense" },
	{ code: "EUR", name: "Euro" },
	{ code: "ARS", name: "Peso argentino" },
	{ code: "UYU", name: "Peso uruguayo" },
	{ code: "BRL", name: "Real brasileño" },
	{ code: "CLP", name: "Peso chileno" },
	{ code: "PYG", name: "Guaraní paraguayo" },
	{ code: "MXN", name: "Peso mexicano" },
	{ code: "COP", name: "Peso colombiano" },
	{ code: "PEN", name: "Sol peruano" },
	{ code: "GBP", name: "Libra esterlina" },
];
