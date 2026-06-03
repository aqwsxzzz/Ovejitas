export type MemberRole = "owner" | "admin" | "member";

export interface IMemberRoleUpdate {
	role: MemberRole;
}

export interface IMemberUserRead {
	id: number;
	name: string;
	email: string;
}

export interface IMemberRead {
	id: number;
	user_id: number;
	role: MemberRole;
	created_at: string;
	user: IMemberUserRead;
}

export interface IPagedMembers {
	data: IMemberRead[];
	meta: {
		page: number;
		page_size: number;
		total: number;
		has_next: boolean;
	};
}
