import { type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
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
		<Button
			variant="ghost"
			onClick={onClick}
			className={cn(
				"rounded-card shadow-card bg-card h-auto w-full justify-start p-4 text-left",
				"hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]",
				className
			)}
		>
			<div className="flex items-start gap-3">
				<div className={cn("shrink-0 mt-1", iconColor)}>
					<Icon className="w-6 h-6" aria-hidden="true" />
				</div>
				<div className="flex-1 min-w-0">
					<h3 className="text-h2 text-foreground mb-1">{title}</h3>
					<p className="text-small text-muted-foreground">{description}</p>
				</div>
			</div>
		</Button>
	);
}
