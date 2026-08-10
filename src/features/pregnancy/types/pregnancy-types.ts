export interface IPregnancyRead {
	id: number;
	farm_id: number;
	individual_id: number;
	reproductive_event_id: number;
	occurred_at: string;
	is_pregnant: boolean;
	offspring_count: number | null;
	/**
	 * Derived on create from `(service_date or occurred_at) + asset.gestation_days`
	 * when omitted on a positive check. Stays null if the asset has no gestation
	 * length configured — a null due date on a pregnant check is a valid state,
	 * and it makes the record invisible to the upcoming-births report.
	 */
	expected_due_at: string | null;
	/** When she was served. Optional; the base date for the derived due date. */
	service_date: string | null;
	/** Who bred her. Optional; must be a different individual in the same farm. */
	sire_individual_id: number | null;
	notes: string | null;
	idempotency_key: string | null;
	created_by: number;
	created_at: string;
	updated_at: string;
}

export interface IPregnancyCreatePayload {
	individual_id: number;
	occurred_at: string;
	is_pregnant: boolean;
	offspring_count?: number | null;
	/** Omit on a positive check to have the backend derive it. */
	expected_due_at?: string | null;
	service_date?: string | null;
	sire_individual_id?: number | null;
	notes?: string | null;
	idempotency_key?: string | null;
}

export interface IPregnancyUpdatePayload {
	occurred_at?: string;
	is_pregnant?: boolean;
	offspring_count?: number | null;
	/** PATCH never re-derives — an already-stored due date only moves if sent here. */
	expected_due_at?: string | null;
	service_date?: string | null;
	sire_individual_id?: number | null;
	notes?: string | null;
}

export interface IPregnancyListResponse {
	data: IPregnancyRead[];
	meta: {
		page: number;
		page_size: number;
		total: number;
		has_next: boolean;
	};
}
