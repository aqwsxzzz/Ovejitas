export interface IFarm {
	id: string;
	name: string;
	latitude: number | null;
	longitude: number | null;
	currency: string | null;
	// Legacy fallback used by existing UI paths.
	currencyCode?: string;
}

export interface IFarmCurrencyOption {
	code: string;
	name: string;
	symbol: string;
}

export interface IUpdateFarmPayload {
	name?: string;
	latitude?: number | null;
	longitude?: number | null;
	currency?: string | null;
}
