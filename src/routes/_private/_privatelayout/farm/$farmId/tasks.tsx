import { createFileRoute } from "@tanstack/react-router";
import { CheckSquare, Calendar, Bell, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute(
	"/_private/_privatelayout/farm/$farmId/tasks"
)({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="flex flex-col gap-4 p-4 max-w-4xl mx-auto pb-24">
			<div className="text-center space-y-2">
				<h1 className="text-h1 text-foreground">Tasks</h1>
				<p className="text-small text-muted-foreground">
					Task management coming soon
				</p>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
				<Card className="rounded-card shadow-card">
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-h2">
							<CheckSquare className="w-5 h-5 text-primary" />
							Daily Tasks
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-small text-muted-foreground">
							Track your daily farm activities and checklists
						</p>
					</CardContent>
				</Card>

				<Card className="rounded-card shadow-card">
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-h2">
							<Calendar className="w-5 h-5 text-primary" />
							Scheduled Activities
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-small text-muted-foreground">
							Manage scheduled farm activities and events
						</p>
					</CardContent>
				</Card>

				<Card className="rounded-card shadow-card">
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-h2">
							<Bell className="w-5 h-5 text-primary" />
							Maintenance Reminders
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-small text-muted-foreground">
							Set up reminders for equipment and facility maintenance
						</p>
					</CardContent>
				</Card>

				<Card className="rounded-card shadow-card">
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-h2">
							<FileText className="w-5 h-5 text-primary" />
							Reports
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-small text-muted-foreground">
							View and generate task completion reports
						</p>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
