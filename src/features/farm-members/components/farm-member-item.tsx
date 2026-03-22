import { Badge } from "@/components/ui/badge";
import type { IFarmMember } from "@/features/farm-members/types/farm-members-types";

interface FarmMemberItemProps {
	member: IFarmMember;
}

export const FarmMemberItem = ({ member }: FarmMemberItemProps) => (
	<div className="flex items-center justify-between p-3 rounded-lg border bg-card">
		<div className="flex flex-col gap-0.5">
			<span className="text-sm font-medium text-foreground">
				{member.user.displayName}
			</span>
			<span className="text-xs text-muted-foreground">{member.user.email}</span>
		</div>
		<Badge variant={member.role === "owner" ? "default" : "secondary"}>
			{member.role}
		</Badge>
	</div>
);
