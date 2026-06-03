import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { IInvitationRead } from "@/features/farm-invitations/types/farm-invitations-types";
import { useRevokeFarmInvitation } from "@/features/farm-invitations/api/farm-invitations-queries";
import { RegenerateLinkDialog } from "@/features/farm-invitations/components/regenerate-link-dialog";
import dayjs from "dayjs";
import { Ban, Clock, Trash2 } from "lucide-react";

const statusIconMap = {
	pending: Clock,
	accepted: null,
	revoked: Ban,
} as const satisfies Record<IInvitationRead["status"], React.ComponentType<{ className?: string }> | null>;

const statusVariantMap = {
	pending: "warning",
	accepted: "success",
	revoked: "secondary",
} as const satisfies Record<IInvitationRead["status"], string>;

const statusLabelMap = {
	pending: "Pendiente",
	accepted: "Aceptada",
	revoked: "Revocada",
} as const satisfies Record<IInvitationRead["status"], string>;

const roleLabelMap = {
	admin: "Admin",
	member: "Miembro",
} as const satisfies Record<IInvitationRead["role"], string>;

interface FarmInvitationItemProps {
	invitation: IInvitationRead;
	farmId: string;
	canManage?: boolean;
}

export const FarmInvitationItem = ({
	invitation,
	farmId,
	canManage = false,
}: FarmInvitationItemProps) => {
	const { mutate: revoke, isPending } = useRevokeFarmInvitation({ farmId });
	const StatusIcon = statusIconMap[invitation.status];

	return (
		<div className="flex items-center justify-between p-3 rounded-lg border bg-card gap-3">
			<div className="flex flex-col gap-0.5 min-w-0">
				<span className="text-sm text-foreground truncate">{invitation.email}</span>
				{invitation.status === "pending" && (
					<span className="text-xs text-muted-foreground">
						Vence {dayjs(invitation.expires_at).format("D MMM YYYY")}
					</span>
				)}
			</div>
			<div className="flex items-center gap-1 shrink-0">
				<Badge variant="outline">{roleLabelMap[invitation.role]}</Badge>
				{StatusIcon && (
					<Tooltip>
						<TooltipTrigger asChild>
							<Badge variant={statusVariantMap[invitation.status]} className="px-1.5">
								<StatusIcon className="h-3.5 w-3.5" />
							</Badge>
						</TooltipTrigger>
						<TooltipContent>{statusLabelMap[invitation.status]}</TooltipContent>
					</Tooltip>
				)}
				{canManage && invitation.status === "pending" && (
					<>
						<RegenerateLinkDialog invitation={invitation} farmId={farmId} />
						<Button
							variant="ghost"
							size="icon"
							className="h-7 w-7 text-muted-foreground hover:text-destructive"
							disabled={isPending}
							onClick={() => revoke(invitation.id)}
						>
							<Trash2 className="h-3.5 w-3.5" />
						</Button>
					</>
				)}
			</div>
		</div>
	);
};
