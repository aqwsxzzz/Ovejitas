import { createFileRoute } from "@tanstack/react-router";
import { CheckSquare, Calendar, Bell, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/common/page-header";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute(
	"/_private/_privatelayout/farm/$farmId/tasks",
)({
	component: RouteComponent,
});

function RouteComponent() {
	const { t } = useTranslation("tasks");

	return (
		<div className="flex flex-col gap-4 p-4 max-w-4xl mx-auto pb-24">
			<PageHeader
				title={t("title")}
				description={t("subtitle")}
			/>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
				<Card className="rounded-card shadow-card">
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-h2">
							<CheckSquare className="w-5 h-5 text-primary" />
							{t("dailyTasks.title")}
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-small text-muted-foreground">
							{t("dailyTasks.subtitle")}
						</p>
					</CardContent>
				</Card>

				<Card className="rounded-card shadow-card">
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-h2">
							<Calendar className="w-5 h-5 text-primary" />
							{t("scheduledActivities.title")}
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-small text-muted-foreground">
							{t("scheduledActivities.subtitle")}
						</p>
					</CardContent>
				</Card>

				<Card className="rounded-card shadow-card">
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-h2">
							<Bell className="w-5 h-5 text-primary" />
							{t("maintenanceReminders.title")}
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-small text-muted-foreground">
							{t("maintenanceReminders.subtitle")}
						</p>
					</CardContent>
				</Card>

				<Card className="rounded-card shadow-card">
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-h2">
							<FileText className="w-5 h-5 text-primary" />
							{t("reports.title")}
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-small text-muted-foreground">
							{t("reports.subtitle")}
						</p>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
