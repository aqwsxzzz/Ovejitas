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
	isActive: boolean;
	role: string;
	language: "es" | "en";
	createdAt: string;
	updatedAt: string;
	lastVisitedFarmId: string;
}

export interface ILoginPayload {
	email: string;
	password: string;
}

export interface ISignUpResponse {
	message: string;
}

export interface ILoginResponse {
	message: string;
	data: { lastVisitedFarmId: string };
}
