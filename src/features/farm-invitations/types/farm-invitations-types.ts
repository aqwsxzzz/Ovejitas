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

export interface IFarmMember {
	id: string;
	farmId: string;
	userId: string;
	role: "owner" | "member";
	user: {
		id: string;
		displayName: string;
		email: string;
	};
}
