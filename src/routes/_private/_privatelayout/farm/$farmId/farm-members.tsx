import { PageHeader } from "@/components/common/page-header";
import { ScrollablePageLayout } from "@/components/layout/scrollable-page-layout";
import { useGetFarmInvitationsList } from "@/features/farm-invitations/api/farm-invitations-queries";
import { FarmInvitationItem } from "@/features/farm-invitations/components/farm-invitation-item";
import { FarmInviteModal } from "@/features/farm-invitations/components/farm-invite-modal";
import { useGetFarmMembers } from "@/features/farm-members/api/farm-members-queries";
import { FarmMemberItem } from "@/features/farm-members/components/farm-member-item";
import { createFileRoute, useParams } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute(
	"/_private/_privatelayout/farm/$farmId/farm-members",
)({
	component: RouteComponent,
});

function RouteComponent() {
	const { t } = useTranslation("farmMembers");
	const { farmId } = useParams({ strict: false });

	const { data: members, isPending: isMembersPending } = useGetFarmMembers({
		farmId: farmId!,
	});

	const { data: invitations, isPending: isInvitationsPending } =
		useGetFarmInvitationsList({ farmId: farmId!, status: "pending" });

	return (
		<ScrollablePageLayout
			header={
				<PageHeader
					title={t("title")}
					description={t("subtitle")}
					action={<FarmInviteModal />}
				/>
			}
		>
			<div className="flex flex-col gap-6 pb-6">
				<section className="flex flex-col gap-3">
					<h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
						{t("activeMembers")}
					</h2>
					{isMembersPending && (
						<p className="text-sm text-muted-foreground">{t("loading")}</p>
					)}
					{!isMembersPending && (members ?? []).length === 0 && (
						<p className="text-sm text-muted-foreground">
							{t("noActiveMembers")}
						</p>
					)}
					{(members ?? []).map((member) => (
						<FarmMemberItem
							key={member.id}
							member={member}
						/>
					))}
				</section>

				<section className="flex flex-col gap-3">
					<h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
						{t("pendingInvitations")}
					</h2>
					{isInvitationsPending && (
						<p className="text-sm text-muted-foreground">{t("loading")}</p>
					)}
					{!isInvitationsPending && (invitations ?? []).length === 0 && (
						<p className="text-sm text-muted-foreground">
							{t("noPendingInvitations")}
						</p>
					)}
					{(invitations ?? []).map((invitation) => (
						<FarmInvitationItem
							key={invitation.id}
							invitation={invitation}
						/>
					))}
				</section>
			</div>
		</ScrollablePageLayout>
	);
}
