export interface IFeedingSchedule {
	id: string;
	farmId: string;
	flockId: string;
	feedTypeId: string;
	qtyPerDay: number;
	activeFrom: string; // ISO date YYYY-MM-DD
	activeTo: string | null; // ISO date YYYY-MM-DD or null if still active
	createdAt: string;
	updatedAt: string;
	flock?: {
		id: string;
		name: string;
	};
	feedType?: {
		id: string;
		name: string;
	};
}

export interface IFeedingScheduleListFilters {
	flockId?: string;
	feedTypeId?: string;
	activeOnly?: boolean;
}

export interface ICreateFeedingSchedulePayload {
	flockId: string;
	feedTypeId: string;
	qtyPerDay: number;
	activeFrom: string; // ISO date YYYY-MM-DD
	activeTo?: string | null; // Optional, omit or null if open-ended
}

export interface IUpdateFeedingSchedulePayload {
	qtyPerDay?: number;
	activeFrom?: string;
	activeTo?: string | null;
}
