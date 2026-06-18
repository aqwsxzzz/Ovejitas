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
