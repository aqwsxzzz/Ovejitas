import { createFileRoute, useParams } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useGetFarmMembers } from "@/features/farm-members/api/farm-members-queries";
import { useGetFarmInvitationsList } from "@/features/farm-invitations/api/farm-invitations-queries";
import { toast } from "sonner";
import { FarmInviteModal } from "@/features/farm-invitations/components/farm-invite-modal";
import { useTranslation } from "react-i18next";
import { PageHeader } from "@/components/common/page-header";

export const Route = createFileRoute(
	"/_private/_privatelayout/farm/$farmId/farm-members",
)({
	component: RouteComponent,
});

function RouteComponent() {
	const { farmId } = useParams({ strict: false });
	const { data: membersData } = useGetFarmMembers({ farmId: farmId! });
	const { data: invitationsData } = useGetFarmInvitationsList({
		farmId: farmId!,
	});
	const { t } = useTranslation("farmMembers");
	//const [inviteOpen, setInviteOpen] = useState(false);

	return (
		<div className="flex flex-col gap-6 p-4">
			<PageHeader
				title={t("title")}
				description="Manage farm members and send invitations"
				action={<FarmInviteModal />}
			/>

			{/* Active Members Section */}
			<section className="mb-8 bg-card rounded-lg shadow p-4">
				<h2 className="text-lg font-semibold text-card-foreground mb-4">
					{t("activeMembers")}
				</h2>
				{membersData && membersData.length === 0 ? (
					<div className="text-muted-foreground">{t("noActiveMembers")}</div>
				) : (
					<ul className="divide-y divide-border">
						{membersData?.map((member) => (
							<li
								key={member.id}
								className="flex items-center justify-between py-3"
							>
								<span className="font-medium text-foreground">
									{member.user.displayName} ( {member.user.email} )
								</span>
								<Badge
									variant={member.role === "owner" ? "default" : "secondary"}
								>
									{member.role}
								</Badge>
							</li>
						))}
					</ul>
				)}
			</section>

			{/* Pending Invitations Section */}
			<section className="bg-card rounded-lg shadow p-4">
				<h2 className="text-lg font-semibold text-card-foreground mb-4">
					{t("pendingInvitations")}
				</h2>
				{invitationsData && invitationsData.length === 0 ? (
					<div className="text-muted-foreground">
						{t("noPendingInvitations")}
					</div>
				) : (
					<ul className="divide-y divide-border">
						{invitationsData
							?.filter((invite) => invite.status === "pending")
							.map((invite) => (
								<li
									key={invite.id}
									className="flex items-center justify-between py-3"
								>
									<div className="flex flex-col max-w-3/4">
										<span
											className="font-medium text-foreground overflow-hidden"
											onClick={() => toast.info(invite.email)}
										>
											{invite.email}
										</span>
										<span className="text-xs text-muted-foreground">
											{invite.status}
										</span>
									</div>
									<Button
										size="sm"
										variant="outline"
										onClick={() => {
											navigator.clipboard.writeText(
												`${import.meta.env.VITE_BASIC_URL}/signup?token=${invite.token}&email=${invite.email}`,
											);
											toast.success(t("linkcopied"));
										}}
									>
										Link
									</Button>
								</li>
							))}
					</ul>
				)}
			</section>
		</div>
	);
}
