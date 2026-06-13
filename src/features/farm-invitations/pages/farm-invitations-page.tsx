import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useGetFarmInvitations } from "@/features/farm-invitations/api/farm-invitations-queries";
import { FarmInvitationItem } from "@/features/farm-invitations/components/farm-invitation-item";
import { InviteDialog } from "@/features/farm-invitations/components/invite-dialog";
import { useGetUserProfile } from "@/features/auth/api/auth-queries";
import { useGetFarmMembers } from "@/features/members/api/members-queries";
import { MemberRow } from "@/features/members/components/member-row";
import { UserPlus } from "lucide-react";

const canManageMembers = (role: string) => role === "owner" || role === "admin";

interface FarmInvitationsPageProps {
	farmId: string;
}

export const FarmInvitationsPage = ({ farmId }: FarmInvitationsPageProps) => {
	const [dialogOpen, setDialogOpen] = useState(false);
	const { data: user } = useGetUserProfile();
	const { data: members = [], isLoading: membersLoading } = useGetFarmMembers({ farmId });
	const { data: invitations = [], isLoading: invitationsLoading } =
		useGetFarmInvitations({ farmId, status: "pending" });

	const isManager = canManageMembers(user?.role ?? "");

	return (
		<section className="space-y-4">
			<div className="v2-card p-5 md:p-6">
				<p className="v2-kicker">Colaboracion</p>
				<h2 className="mt-2 text-xl font-semibold">Acceso a la granja</h2>
				<p className="mt-1 text-sm text-(--v2-ink-soft)">
					Gestiona quienes tienen acceso y sus roles.
				</p>
			</div>

			<div className="v2-card p-5 space-y-3">
				<h3 className="text-sm font-semibold text-(--v2-ink)">Miembros</h3>
				{membersLoading ? (
					<div className="h-14 w-full rounded-lg bg-muted/40 animate-pulse" />
				) : members.length === 0 ? (
					<p className="text-sm text-muted-foreground py-2">
						No hay miembros en esta granja.
					</p>
				) : (
					<div className="space-y-2">
						{members.map((member) => (
							<MemberRow
								key={member.id}
								member={member}
								farmId={farmId}
								isCurrentUser={member.user.email === user?.email}
								canManage={isManager}
							/>
						))}
					</div>
				)}
			</div>

			<div className="v2-card p-5 space-y-3">
				<div className="flex items-center justify-between">
					<h3 className="text-sm font-semibold text-(--v2-ink)">
						Invitaciones pendientes
					</h3>
					{isManager && (
						<Button size="sm" onClick={() => setDialogOpen(true)}>
							<UserPlus className="h-4 w-4" />
							Invitar
						</Button>
					)}
				</div>
				{invitationsLoading ? (
					<div className="h-14 w-full rounded-lg bg-muted/40 animate-pulse" />
				) : invitations.length === 0 ? (
					<p className="text-sm text-muted-foreground py-2">
						No hay invitaciones pendientes.
					</p>
				) : (
					<div className="space-y-2">
						{invitations.map((invitation) => (
							<FarmInvitationItem
								key={invitation.id}
								invitation={invitation}
								farmId={farmId}
								canManage={isManager}
							/>
						))}
					</div>
				)}
			</div>

			<InviteDialog
				farmId={farmId}
				open={dialogOpen}
				onOpenChange={setDialogOpen}
			/>
		</section>
	);
};
