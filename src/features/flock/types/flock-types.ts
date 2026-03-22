export type IFlockType = "layers" | "broilers" | "dual_purpose" | "general";

export type IFlockStatus = "active" | "sold" | "culled" | "completed";

export type IFlockEventType =
	| "mortality"
	| "sale"
	| "cull"
	| "addition"
	| "transfer";

export interface ITranslatedSpecies {
	id: string;
	translations: Array<{
		id: string;
		language: string;
		name: string;
		speciesId: string;
	}>;
}

export interface ITranslatedBreed {
	id: string;
	speciesId: string;
	translations: Array<{
		id: string;
		language: string;
		name: string;
		breedId: string;
	}>;
}

export interface IFlock {
	id: string;
	farmId: string;
	speciesId: string;
	breedId: string;
	name: string;
	flockType: IFlockType;
	initialCount: number;
	currentCount: number;
	status: IFlockStatus;
	startDate: string;
	endDate: string | null;
	houseName: string | null;
	acquisitionType: "hatched" | "purchased" | "other";
	ageAtAcquisitionWeeks: number | null;
	notes: string | null;
	createdAt: string;
	updatedAt: string;
	species?: ITranslatedSpecies;
	breed?: ITranslatedBreed;
}

export interface IFlockListFilters {
	status?: IFlockStatus;
	flockType?: IFlockType;
	speciesId?: string;
}

export interface ICreateFlockPayload {
	name: string;
	speciesId: string;
	breedId: string;
	flockType: IFlockType;
	initialCount: number;
	startDate: string;
	acquisitionType: "hatched" | "purchased" | "other";
	language: string;
	endDate?: string;
	houseName?: string;
	ageAtAcquisitionWeeks?: number;
	notes?: string;
}

export interface IUpdateFlockPayload {
	currentCount: number;
}

export interface ICreateFlockEventPayload {
	eventType: IFlockEventType;
	count: number;
	date: string;
	reason?: string;
}

export interface IFlockEvent {
	id: string;
	flockId: string;
	eventType: IFlockEventType;
	count: number;
	date: string;
	reason: string | null;
	recordedBy: string | null;
	createdAt: string;
	updatedAt: string;
}

export interface IEggCollection {
	id: string;
	flockId: string;
	date: string;
	totalEggs: number;
	brokenEggs: number;
	usableEggs: number;
	layRate: number;
	collectedBy: string | null;
	notes: string | null;
	createdAt: string;
	updatedAt: string;
}
