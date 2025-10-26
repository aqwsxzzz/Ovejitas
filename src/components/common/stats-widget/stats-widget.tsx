import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsWidgetProps {
	icon: LucideIcon;
	iconColor?: string;
	borderColor?: string;
	label: string;
	value: string | number;
	trend?: {
		value: string;
		direction: "up" | "down" | "neutral";
	};
	onClick?: () => void;
	className?: string;
}

export function StatsWidget({
	icon: Icon,
	iconColor = "text-primary",
	borderColor = "border-l-primary",
	label,
	value,
	trend,
	onClick,
	className,
}: StatsWidgetProps) {
	const Component = onClick ? "button" : "div";

	return (
		<Component
			onClick={onClick}
			className={cn(
				"rounded-widget shadow-widget bg-card p-4 border-l-4 transition-all",
				"min-h-[88px] flex items-center gap-4",
				borderColor,
				onClick && "cursor-pointer hover:shadow-lg hover:scale-[1.02]",
				className
			)}
		>
			<div className={cn("flex-shrink-0", iconColor)}>
				<Icon className="w-8 h-8" aria-hidden="true" />
			</div>

			<div className="flex-1 min-w-0">
				<div className="flex items-baseline gap-2">
					<span className="text-display font-bold text-foreground truncate">
						{value}
					</span>
					{trend && (
						<span
							className={cn(
								"text-small font-medium",
								trend.direction === "up" && "text-success",
								trend.direction === "down" && "text-error",
								trend.direction === "neutral" && "text-muted-foreground"
							)}
						>
							{trend.direction === "up" && "↑"}
							{trend.direction === "down" && "↓"}
							{trend.value}
						</span>
					)}
				</div>
				<p className="text-body text-muted-foreground mt-1">{label}</p>
			</div>
		</Component>
	);
}
