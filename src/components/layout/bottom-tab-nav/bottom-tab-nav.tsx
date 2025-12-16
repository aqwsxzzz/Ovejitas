import { Link, useParams, useRouterState } from "@tanstack/react-router";
import { Home, Beef, CheckSquare, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface TabItem {
	id: string;
	label: string;
	icon: React.ElementType;
	path: string;
}

export function BottomTabNav() {
	const { farmId } = useParams({ strict: false });
	const router = useRouterState();
	const currentPath = router.location.pathname;
	const { t } = useTranslation("bottomTabNav");

	const tabs: TabItem[] = [
		{
			id: "dashboard",
			label: t("tabs.dashboard"),
			icon: Home,
			path: `/farm/${farmId}/dashboard`,
		},
		{
			id: "animals",
			label: t("tabs.animals"),
			icon: Beef,
			path: `/farm/${farmId}/species`,
		},
		{
			id: "tasks",
			label: t("tabs.tasks"),
			icon: CheckSquare,
			path: `/farm/${farmId}/tasks`,
		},
		{
			id: "profile",
			label: t("tabs.profile"),
			icon: User,
			path: `/farm/${farmId}/farm-members`,
		},
	];

	const isActiveTab = (tabPath: string) => {
		return currentPath.startsWith(tabPath);
	};

	return (
		<nav
			className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50"
			style={{ height: "68px" }}
			aria-label="Main navigation"
		>
			<div className="h-full flex items-center justify-around max-w-screen-lg mx-auto px-2">
				{tabs.map((tab) => {
					const Icon = tab.icon;
					const isActive = isActiveTab(tab.path);

					return (
						<Link
							key={tab.id}
							to={tab.path}
							className={cn(
								"flex flex-col items-center justify-center gap-1 min-w-[44px] px-3 py-2 rounded-lg transition-colors",
								"hover:bg-secondary/50",
								isActive
									? "text-primary"
									: "text-muted-foreground hover:text-foreground",
							)}
							aria-current={isActive ? "page" : undefined}
						>
							<Icon
								className={cn(
									"w-6 h-6 transition-all",
									isActive && "stroke-[2.5]",
								)}
								aria-hidden="true"
							/>
							<span
								className={cn(
									"text-caption font-medium transition-opacity",
									isActive ? "opacity-100" : "opacity-0",
								)}
							>
								{tab.label}
							</span>
						</Link>
					);
				})}
			</div>
		</nav>
	);
}
