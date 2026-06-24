export interface IPregnancyRead {
	id: number;
	farm_id: number;
	individual_id: number;
	reproductive_event_id: number;
	occurred_at: string;
	is_pregnant: boolean;
	offspring_count: number | null;
	expected_due_at: string | null;
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
	expected_due_at?: string | null;
	notes?: string | null;
	idempotency_key?: string | null;
}

export interface IPregnancyUpdatePayload {
	occurred_at?: string;
	is_pregnant?: boolean;
	offspring_count?: number | null;
	expected_due_at?: string | null;
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
