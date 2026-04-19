import { createFileRoute, useParams, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/page-header";
import { ScrollablePageLayout } from "@/components/layout/scrollable-page-layout";
import { Button } from "@/components/ui/button";
import { FarmSettingsForm } from "@/features/farm/components/farm-settings-form";

export const Route = createFileRoute(
	"/_private/_privatelayout/farm/$farmId/farms",
)({
	component: RouteComponent,
});

function RouteComponent() {
	const { farmId } = useParams({ strict: false });

	if (!farmId) {
		return null;
	}

	return (
		<ScrollablePageLayout
			className="max-w-5xl mx-auto pb-24"
			header={
				<PageHeader
					title="Farm Settings"
					description="Manage identity, location, currency and future farm-level configuration."
					action={
						<Button
							variant="outline"
							asChild
						>
							<Link
								to="/farm/$farmId/farm-members"
								params={{ farmId }}
							>
								Farm Members
							</Link>
						</Button>
					}
				/>
			}
		>
			<FarmSettingsForm farmId={farmId} />
		</ScrollablePageLayout>
	);
}
