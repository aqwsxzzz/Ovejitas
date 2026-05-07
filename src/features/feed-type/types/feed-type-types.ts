export interface IFeedType {
	id: string;
	farmId: string;
	name: string;
	notes: string | null;
	createdAt: string;
	updatedAt: string;
}

export interface IFeedTypeListFilters {
	page?: number;
	limit?: number;
}

export interface ICreateFeedTypePayload {
	name: string;
	notes?: string;
}

export interface IUpdateFeedTypePayload {
	name?: string;
	notes?: string;
}
