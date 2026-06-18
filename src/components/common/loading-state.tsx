import { cn } from "@/lib/utils";

import { FarmAnimalSpinner } from "./farm-animal-spinner";

interface LoadingStateProps {
	/** Message shown under the spinner. Defaults to a generic loading copy. */
	message?: string;
	size?: "sm" | "md" | "lg";
	className?: string;
}

/**
 * Standard full-block loading indicator: a centered farm-animal spinner with a
 * short message. Use anywhere a view is fetching its primary data.
 */
export function LoadingState({
	message = "Cargando...",
	size = "md",
	className,
}: LoadingStateProps) {
	return (
		<div
			className={cn(
				"flex flex-col items-center justify-center gap-3 py-10 text-center",
				className,
			)}
			role="status"
			aria-live="polite"
		>
			<FarmAnimalSpinner size={size} />
			<p className="text-sm text-(--v2-ink-soft)">{message}</p>
		</div>
	);
}
