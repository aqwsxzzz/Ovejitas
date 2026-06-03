export type InvitationRole = "admin" | "member";
export type InvitationStatus = "pending" | "accepted" | "revoked";

export interface IInvitationRead {
	id: number;
	farm_id: number;
	email: string;
	role: InvitationRole;
	status: InvitationStatus;
	expires_at: string;
	created_at: string;
}

export interface IInvitationCreatePayload {
	email: string;
	role: InvitationRole;
}

export interface IInvitationCreateResponse {
	invitation: IInvitationRead;
	token: string;
}

export interface IInvitationPageMeta {
	page: number;
	page_size: number;
	total: number;
	has_next: boolean;
}

export interface IInvitationListResponse {
	data: IInvitationRead[];
	meta: IInvitationPageMeta;
}

export interface IInvitationResolve {
	farm_id: number;
	farm_name: string;
	role: InvitationRole;
	email: string;
	requires_registration: boolean;
}

export interface IAcceptInvitationPayload {
	password: string;
	name?: string;
}
