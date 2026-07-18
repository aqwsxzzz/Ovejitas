/**
 * Currency is a first-class, per-farm resource (BE-owned ISO 4217 allowlist).
 * Monetary events reference a currency by `currency_id`; the display code lives
 * here on `CurrencyRead`. See backend-docs/api/currencies.yaml.
 */
export interface ICurrency {
	id: number;
	farm_id: number;
	code: string;
	name: string;
	symbol: string | null;
	archived_at: string | null;
	created_at: string;
	updated_at: string;
}

export interface ICurrencyCreate {
	code: string;
	name: string;
	symbol?: string | null;
}

export interface ICurrencyUpdate {
	name?: string | null;
	symbol?: string | null;
	archived_at?: string | null;
}

export interface IPagedCurrencies {
	data: ICurrency[];
	meta: {
		page: number;
		page_size: number;
		total: number;
		has_next: boolean;
	};
}
