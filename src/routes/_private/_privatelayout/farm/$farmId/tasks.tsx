import { createFileRoute } from "@tanstack/react-router";
import { CheckSquare, Calendar, Bell, FileText, Circle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute(
	"/_private/_privatelayout/farm/$farmId/tasks",
)({
	component: RouteComponent,
});

function RouteComponent() {
	const { t } = useTranslation("tasks");
	const storageKey = "farm-tasks-progress-v1";

	const [completedById, setCompletedById] = useState<Record<string, boolean>>(
		() => {
			if (typeof window === "undefined") {
				return {};
			}

			const storedValue = window.localStorage.getItem(storageKey);
			if (!storedValue) {
				return {};
			}

			try {
				return JSON.parse(storedValue) as Record<string, boolean>;
			} catch {
				return {};
			}
		},
	);

	const taskGroups = [
		{
			id: "daily",
			icon: CheckSquare,
			title: t("dailyTasks.title"),
			description: t("dailyTasks.subtitle"),
			items: [
				{ id: "daily-feed", label: t("checklist.dailyFeed") },
				{ id: "daily-water", label: t("checklist.dailyWater") },
			],
		},
		{
			id: "scheduled",
			icon: Calendar,
			title: t("scheduledActivities.title"),
			description: t("scheduledActivities.subtitle"),
			items: [
				{ id: "scheduled-vet", label: t("checklist.scheduledVet") },
				{ id: "scheduled-breeding", label: t("checklist.scheduledBreeding") },
			],
		},
		{
			id: "maintenance",
			icon: Bell,
			title: t("maintenanceReminders.title"),
			description: t("maintenanceReminders.subtitle"),
			items: [
				{ id: "maintenance-fencing", label: t("checklist.maintenanceFencing") },
				{ id: "maintenance-water", label: t("checklist.maintenanceWater") },
			],
		},
		{
			id: "reports",
			icon: FileText,
			title: t("reports.title"),
			description: t("reports.subtitle"),
			items: [
				{ id: "report-weekly", label: t("checklist.reportWeekly") },
				{ id: "report-expenses", label: t("checklist.reportExpenses") },
			],
		},
	];

	const totalTaskCount = taskGroups.reduce(
		(acc, group) => acc + group.items.length,
		0,
	);

	const completedTaskCount = useMemo(
		() =>
			taskGroups.reduce(
				(acc, group) =>
					acc + group.items.filter((item) => completedById[item.id]).length,
				0,
			),
		[completedById, taskGroups],
	);

	const completionPercent =
		totalTaskCount === 0
			? 0
			: Math.round((completedTaskCount / totalTaskCount) * 100);

	const toggleTask = (taskId: string) => {
		setCompletedById((previous) => {
			const next = {
				...previous,
				[taskId]: !previous[taskId],
			};

			if (typeof window !== "undefined") {
				window.localStorage.setItem(storageKey, JSON.stringify(next));
			}

			return next;
		});
	};

	const resetProgress = () => {
		setCompletedById({});
		if (typeof window !== "undefined") {
			window.localStorage.removeItem(storageKey);
		}
	};

	return (
		<div className="flex flex-col gap-4 p-4 max-w-4xl mx-auto pb-24">
			<PageHeader
				title={t("title")}
				description={t("subtitle")}
				action={
					<Button
						variant="outline"
						onClick={resetProgress}
					>
						{t("actions.reset")}
					</Button>
				}
			/>

			<Card className="rounded-card shadow-card">
				<CardContent className="p-4 flex flex-col gap-2">
					<div className="flex items-center justify-between gap-3">
						<p className="text-small text-muted-foreground">
							{t("progress.label")}
						</p>
						<p className="text-h2 font-semibold text-foreground">
							{completionPercent}%
						</p>
					</div>
					<div className="h-2 rounded-full bg-muted overflow-hidden">
						<div
							className="h-full bg-primary transition-all"
							style={{ width: `${completionPercent}%` }}
						/>
					</div>
					<p className="text-caption text-muted-foreground">
						{t("progress.count", {
							completed: completedTaskCount,
							total: totalTaskCount,
						})}
					</p>
				</CardContent>
			</Card>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
				{taskGroups.map((group) => {
					const Icon = group.icon;
					return (
						<Card
							key={group.id}
							className="rounded-card shadow-card"
						>
							<CardHeader>
								<CardTitle className="flex items-center gap-2 text-h2">
									<Icon className="w-5 h-5 text-primary" />
									{group.title}
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-3">
								<p className="text-small text-muted-foreground">
									{group.description}
								</p>
								<div className="space-y-2">
									{group.items.map((item) => {
										const isCompleted = Boolean(completedById[item.id]);
										return (
											<button
												key={item.id}
												type="button"
												onClick={() => toggleTask(item.id)}
												className="w-full flex items-center gap-2 text-left rounded-lg border border-border px-3 py-2 hover:bg-muted"
											>
												{isCompleted ? (
													<CheckSquare className="h-4 w-4 text-success" />
												) : (
													<Circle className="h-4 w-4 text-muted-foreground" />
												)}
												<span
													className={
														isCompleted
															? "line-through text-muted-foreground"
															: ""
													}
												>
													{item.label}
												</span>
											</button>
										);
									})}
								</div>
							</CardContent>
						</Card>
					);
				})}
			</div>
		</div>
	);
}
