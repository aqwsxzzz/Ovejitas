import { Badge } from "@/components/ui/badge";
import type { IFarmInvitationResponse } from "@/features/farm-invitations/types/farm-invitations-types";
import dayjs from "dayjs";

const statusVariantMap = {
	pending: "warning",
	accepted: "success",
	expired: "error",
	cancelled: "secondary",
} as const satisfies Record<IFarmInvitationResponse["status"], string>;

interface FarmInvitationItemProps {
	invitation: IFarmInvitationResponse;
}

export const FarmInvitationItem = ({ invitation }: FarmInvitationItemProps) => (
	<div className="flex items-center justify-between p-3 rounded-lg border bg-card">
		<div className="flex flex-col gap-0.5">
			<span className="text-sm text-foreground">{invitation.email}</span>
			{invitation.status === "pending" && (
				<span className="text-xs text-muted-foreground">
					Expires {dayjs(invitation.expiresAt).format("MMM D, YYYY")}
				</span>
			)}
		</div>
		<Badge variant={statusVariantMap[invitation.status]}>
			{invitation.status}
		</Badge>
	</div>
);
