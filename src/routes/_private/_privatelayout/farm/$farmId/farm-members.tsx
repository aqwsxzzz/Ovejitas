import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
// import { FarmInviteModal } from "@/features/farm-invitations/components/farm-invite-modal";

// Dummy data for demonstration
const activeMembers = [
	{ id: 1, name: "Alice Johnson", status: "Owner" },
	{ id: 2, name: "Bob Smith", status: "Member" },
];
const pendingInvites = [
	{
		id: 1,
		name: "carol@email.com",
		status: "Pending",
		inviteLink: "https://example.com/invite/abc123",
	},
	{
		id: 2,
		name: "dave@email.com",
		status: "Cancelled",
		inviteLink: "https://example.com/invite/def456",
	},
];

export const Route = createFileRoute(
	"/_private/_privatelayout/farm/$farmId/farm-members",
)({
	component: RouteComponent,
});

function RouteComponent() {
	// const [inviteOpen, setInviteOpen] = useState(false);

	return (
		<div className="p-6 max-w-3xl mx-auto">
			{/* Header */}
			<div className="flex items-center justify-between mb-8">
				<h1 className="text-2xl font-bold text-primary">Farm Members</h1>
				{/* Uncomment when modal is ready */}
				{/* <FarmInviteModal open={inviteOpen} onOpenChange={setInviteOpen} /> */}
				<Button className="bg-primary text-primary-foreground">Invite</Button>
			</div>

			{/* Active Members Section */}
			<section className="mb-8 bg-card rounded-lg shadow p-4">
				<h2 className="text-lg font-semibold text-card-foreground mb-4">
					Active Members
				</h2>
				{activeMembers.length === 0 ? (
					<div className="text-muted-foreground">No active members yet.</div>
				) : (
					<ul className="divide-y divide-border">
						{activeMembers.map((member) => (
							<li
								key={member.id}
								className="flex items-center justify-between py-3"
							>
								<span className="font-medium text-foreground">
									{member.name}
								</span>
								<Badge
									variant={member.status === "Owner" ? "default" : "secondary"}
								>
									{member.status}
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
				{pendingInvites.length === 0 ? (
					<div className="text-muted-foreground">No pending invitations.</div>
				) : (
					<ul className="divide-y divide-border">
						{pendingInvites.map((invite) => (
							<li
								key={invite.id}
								className="flex items-center justify-between py-3"
							>
								<div className="flex flex-col">
									<span className="font-medium text-foreground">
										{invite.name}
									</span>
									<span className="text-xs text-muted-foreground">
										{invite.status}
									</span>
								</div>
								<Button
									size="sm"
									variant="outline"
									onClick={() =>
										navigator.clipboard.writeText(invite.inviteLink)
									}
								>
									Copy Invitation Link
								</Button>
							</li>
						))}
					</ul>
				)}
			</section>
		</div>
	);
}
