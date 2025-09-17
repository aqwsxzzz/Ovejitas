export interface IFarmInvitationPayload {
	email: string;
	farmId: string;
}

export interface IFarmInvitationResponse {
	id: string;
	email: string;
	farmId: string;
	role: "owner" | "member";
	status: "pending" | "accepted" | "expired" | "cancelled";
	token: string;
}
