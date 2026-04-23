export interface ISignUpPayload {
	displayName: string;
	email: string;
	password: string;
	invitationToken?: string;
}

export interface IUser {
	id: string;
	displayName: string;
	email: string;
	role: string;
	createdAt: string;
	lastVisitedFarmId: string;
}

export interface ITokenPair {
	access_token: string;
	refresh_token: string;
	token_type?: string;
}

export interface IFarmMembership {
	farm_id: number;
	role: string;
}

export interface IBackendUser {
	id: number;
	email: string;
	name: string;
	created_at: string;
}

export interface IMeResponse {
	user: IBackendUser;
	memberships: IFarmMembership[];
}

export interface ILoginPayload {
	email: string;
	password: string;
}

export interface IRefreshPayload {
	refresh_token: string;
}
