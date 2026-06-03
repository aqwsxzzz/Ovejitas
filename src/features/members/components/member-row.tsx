import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useRemoveFarmMember, useUpdateMemberRole } from "@/features/members/api/members-queries";
import type { IMemberRead, MemberRole } from "@/features/members/types/members-types";
import { Trash2 } from "lucide-react";

const roleLabelMap: Record<MemberRole, string> = {
	owner: "Propietario",
	admin: "Admin",
	member: "Miembro",
};

const ROLES: MemberRole[] = ["owner", "admin", "member"];

interface MemberRowProps {
	member: IMemberRead;
	farmId: string;
	isCurrentUser: boolean;
	canManage: boolean;
}

export const MemberRow = ({ member, farmId, isCurrentUser, canManage }: MemberRowProps) => {
	const { mutate: updateRole, isPending: isUpdating } = useUpdateMemberRole({ farmId });
	const { mutate: removeMember, isPending: isRemoving } = useRemoveFarmMember({ farmId });

	const showControls = canManage && !isCurrentUser;
	const isPending = isUpdating || isRemoving;

	return (
		<div className="flex items-center justify-between p-3 rounded-lg border bg-card gap-3">
			<div className="flex flex-col gap-0.5 min-w-0">
				<span className="text-sm font-medium text-foreground truncate">
					{member.user.name}
				</span>
				<span className="text-xs text-muted-foreground truncate">
					{member.user.email}
				</span>
			</div>
			<div className="flex items-center gap-1 shrink-0">
				{showControls ? (
					<Select
						value={member.role}
						disabled={isPending}
						onValueChange={(value) =>
							updateRole({ memberId: member.id, payload: { role: value as MemberRole } })
						}
					>
						<SelectTrigger size="sm" className="w-[120px]">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{ROLES.map((role) => (
								<SelectItem key={role} value={role}>
									{roleLabelMap[role]}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				) : (
					<Badge variant="outline">{roleLabelMap[member.role]}</Badge>
				)}
				{isCurrentUser && <Badge variant="secondary">Tú</Badge>}
				{showControls && (
					<Button
						variant="ghost"
						size="icon"
						className="h-7 w-7 text-muted-foreground hover:text-destructive"
						disabled={isPending}
						onClick={() => removeMember(member.id)}
					>
						<Trash2 className="h-3.5 w-3.5" />
					</Button>
				)}
			</div>
		</div>
	);
};
