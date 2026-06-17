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
}

/** v1 farm record — owns the `default_currency` the event ledger reads. */
export interface IV1Farm {
	id: number;
	name: string;
	default_currency: string;
	created_at: string;
	updated_at: string;
}

export interface IV1FarmUpdatePayload {
	name?: string;
	default_currency?: string;
}
