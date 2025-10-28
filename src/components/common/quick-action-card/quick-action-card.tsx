import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickActionCardProps {
	icon: LucideIcon;
	iconColor?: string;
	title: string;
	description: string;
	onClick: () => void;
	className?: string;
}

export function QuickActionCard({
	icon: Icon,
	iconColor = "text-primary",
	title,
	description,
	onClick,
	className,
}: QuickActionCardProps) {
	return (
		<button
			onClick={onClick}
			className={cn(
				"rounded-card shadow-card bg-card p-4 transition-all",
				"hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]",
				"text-left w-full",
				className
			)}
		>
			<div className="flex items-start gap-3">
				<div className={cn("flex-shrink-0 mt-1", iconColor)}>
					<Icon className="w-6 h-6" aria-hidden="true" />
				</div>
				<div className="flex-1 min-w-0">
					<h3 className="text-h2 text-foreground mb-1">{title}</h3>
					<p className="text-small text-muted-foreground">{description}</p>
				</div>
			</div>
		</button>
	);
}
