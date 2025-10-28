import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActivityItem {
	id: string;
	icon: LucideIcon;
	iconColor?: string;
	title: string;
	description: string;
	timestamp: string;
	action?: {
		label: string;
		onClick: () => void;
	};
}

interface ActivityFeedProps {
	items: ActivityItem[];
	emptyMessage?: string;
}

export function ActivityFeed({ items, emptyMessage = "No recent activity" }: ActivityFeedProps) {
	if (items.length === 0) {
		return (
			<div className="rounded-card shadow-card bg-card p-8 text-center">
				<p className="text-small text-muted-foreground">{emptyMessage}</p>
			</div>
		);
	}

	return (
		<div className="rounded-card shadow-card bg-card divide-y divide-border">
			{items.map((item, index) => {
				const Icon = item.icon;
				return (
					<div
						key={item.id}
						className={cn(
							"p-4 flex items-start gap-4 transition-colors hover:bg-secondary/30",
							index === 0 && "rounded-t-card",
							index === items.length - 1 && "rounded-b-card"
						)}
					>
						{/* Timeline Connector */}
						<div className="relative flex flex-col items-center">
							<div
								className={cn(
									"w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
									item.iconColor || "bg-primary/10 text-primary"
								)}
							>
								<Icon className="w-5 h-5" aria-hidden="true" />
							</div>
							{index !== items.length - 1 && (
								<div className="w-0.5 h-full bg-border absolute top-10" />
							)}
						</div>

						{/* Content */}
						<div className="flex-1 min-w-0 pt-1">
							<div className="flex items-start justify-between gap-2">
								<div className="flex-1 min-w-0">
									<h3 className="text-body font-semibold text-foreground">
										{item.title}
									</h3>
									<p className="text-small text-muted-foreground mt-1">
										{item.description}
									</p>
								</div>
								{item.action && (
									<button
										onClick={item.action.onClick}
										className="text-small font-medium text-primary hover:text-primary/80 transition-colors flex-shrink-0"
									>
										{item.action.label}
									</button>
								)}
							</div>
							<p className="text-caption text-muted-foreground mt-2">
								{item.timestamp}
							</p>
						</div>
					</div>
				);
			})}
		</div>
	);
}
