import { cn } from "@/lib/utils";

interface HealthStatusIndicatorProps {
	status: "alive" | "deceased" | "sold" | null;
	className?: string;
}

export const HealthStatusIndicator = ({
	status,
	className,
}: HealthStatusIndicatorProps) => {
	const getStatusColor = (status: "alive" | "deceased" | "sold" | null) => {
		switch (status) {
			case "alive":
				return "bg-[var(--color-success)]";
			case "deceased":
				return "bg-[var(--color-error)]";
			case "sold":
				return "bg-[var(--color-info)]";
			default:
				return "bg-muted";
		}
	};

	return (
		<div
			className={cn(
				"w-2 h-2 rounded-full flex-shrink-0",
				getStatusColor(status),
				className,
			)}
			aria-label={`Health status: ${status || "unknown"}`}
		/>
	);
};
