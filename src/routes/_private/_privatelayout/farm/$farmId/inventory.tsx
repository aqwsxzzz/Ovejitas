import { PageHeader } from "@/components/common/page-header";
import { ScrollablePageLayout } from "@/components/layout/scrollable-page-layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FeedConsumptionPanel } from "@/features/inventory/components/feed-consumption-panel";
import { FeedLotPanel } from "@/features/inventory/components/feed-lot-panel";
import { FeedReportsPanel } from "@/features/inventory/components/feed-reports-panel";
import { FeedingSchedulePanel } from "@/features/inventory/components/feeding-schedule-panel";
import { createFileRoute, useParams } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute(
	"/_private/_privatelayout/farm/$farmId/inventory",
)({
	component: RouteComponent,
});

function RouteComponent() {
	const { farmId } = useParams({ strict: false });
	const { t } = useTranslation("inventory");

	if (!farmId) {
		return null;
	}

	return (
		<ScrollablePageLayout
			className="max-w-5xl mx-auto pb-24"
			header={
				<PageHeader
					title={t("page.title")}
					description={t("page.description")}
				/>
			}
		>
			<Tabs
				defaultValue="feed-lots"
				className="space-y-4"
			>
				<TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto gap-1">
					<TabsTrigger value="feed-lots">{t("tabs.feedLots")}</TabsTrigger>
					<TabsTrigger value="consumptions">{t("tabs.feedLog")}</TabsTrigger>
					<TabsTrigger value="schedules">
						{t("tabs.feedingSchedules")}
					</TabsTrigger>
					<TabsTrigger value="reports">{t("tabs.feedReports")}</TabsTrigger>
				</TabsList>

				<TabsContent value="feed-lots">
					<FeedLotPanel farmId={farmId} />
				</TabsContent>

				<TabsContent value="consumptions">
					<FeedConsumptionPanel farmId={farmId} />
				</TabsContent>

				<TabsContent value="schedules">
					<FeedingSchedulePanel farmId={farmId} />
				</TabsContent>

				<TabsContent value="reports">
					<FeedReportsPanel farmId={farmId} />
				</TabsContent>
			</Tabs>
		</ScrollablePageLayout>
	);
}
