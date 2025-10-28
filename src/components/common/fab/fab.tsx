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

	const variantClasses = {
		primary: "bg-primary text-primary-foreground hover:bg-primary/90",
		secondary:
			"bg-background text-foreground border-2 border-primary hover:bg-muted",
	};

	return (
		<button
			onClick={onClick}
			className={cn(
				"fixed z-50 w-14 h-14 rounded-full shadow-lg transition-all",
				"flex items-center justify-center",
				"hover:scale-110 active:scale-95",
				positionClasses[position],
				variantClasses[variant],
				className,
			)}
			aria-label={ariaLabel}
		>
			<Icon className="h-6 w-6" />
		</button>
	);
};
