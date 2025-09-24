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
