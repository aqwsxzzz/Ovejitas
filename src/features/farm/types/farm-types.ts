/** v1 farm record — owns the `default_currency` the event ledger reads. */
export interface IV1Farm {
	id: number;
	name: string;
	default_currency: string;
	/** IANA timezone name (e.g. "America/Montevideo"). Drives produce FIFO basket day-grouping. */
	timezone: string;
	created_at: string;
	updated_at: string;
}

export interface IV1FarmUpdatePayload {
	name?: string;
	default_currency?: string;
	timezone?: string;
}
