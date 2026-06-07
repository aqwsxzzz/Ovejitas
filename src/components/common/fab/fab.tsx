import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface FABProps {
	icon: LucideIcon;
	onClick?: () => void;
	className?: string;
	variant?: "primary" | "secondary";
	position?: "bottom-right" | "bottom-left" | "bottom-center";
	ariaLabel?: string;
}

export const FAB = ({
	icon: Icon,
	onClick,
	className,
	variant = "primary",
	position = "bottom-right",
	ariaLabel = "Floating action button",
}: FABProps) => {
	const positionClasses = {
		"bottom-right": "bottom-20 right-4",
		"bottom-left": "bottom-20 left-4",
		"bottom-center": "bottom-20 left-1/2 -translate-x-1/2",
	};

	return (
		<Button
			variant={variant === "primary" ? "default" : "outline"}
			size="icon"
			onClick={onClick}
			className={cn(
				"fixed z-50 h-14 w-14 rounded-full shadow-lg",
				"hover:scale-110 active:scale-95",
				variant === "secondary" && "border-2 border-primary",
				positionClasses[position],
				className,
			)}
			aria-label={ariaLabel}
		>
			<Icon className="h-6 w-6" />
		</Button>
	);
};
