import { createFileRoute, useParams } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useGetFarmMembers } from "@/features/farm-members/api/farm-members-queries";
import { useGetFarmInvitationsList } from "@/features/farm-invitations/api/farm-invitations-queries";
import { toast } from "sonner";
import { FarmInviteModal } from "@/features/farm-invitations/components/farm-invite-modal";

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
	//const [inviteOpen, setInviteOpen] = useState(false);

	return (
		<div className="flex flex-col p-6">
			{/* Header */}
			<div className="flex items-center justify-between mb-8">
				<h1 className="text-2xl font-bold text-primary">Farm Members</h1>
				{/* Uncomment when modal is ready */}
				<FarmInviteModal />
				{/* <Button className="bg-primary text-primary-foreground">Invite</Button> */}
			</div>

			{/* Active Members Section */}
			<section className="mb-8 bg-card rounded-lg shadow p-4">
				<h2 className="text-lg font-semibold text-card-foreground mb-4">
					Active Members
				</h2>
				{membersData && membersData.length === 0 ? (
					<div className="text-muted-foreground">No active members yet.</div>
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
					Pending Invitations
				</h2>
				{invitationsData && invitationsData.length === 0 ? (
					<div className="text-muted-foreground">No pending invitations.</div>
				) : (
					<ul className="divide-y divide-border">
						{invitationsData?.map((invite) => (
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
											`${import.meta.env.VITE_BASIC_URL}/signup?token=${invite.token}`,
										);
										toast.success("Invitation link copied to clipboard");
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
