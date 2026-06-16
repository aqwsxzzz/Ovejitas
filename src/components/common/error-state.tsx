import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ErrorStateProps {
	/** Headline. Defaults to a generic load-failure message. */
	title?: string;
	/** Optional detail, e.g. a specific message from the API. */
	description?: string | null;
	/** When provided, renders a "Reintentar" button that calls this. */
	onRetry?: () => void;
	className?: string;
}

/**
 * Standard data-view error placeholder: a centered alert icon with a message
 * and an optional retry action. Use when a query/fetch for a view's data
 * fails. For write-action failures use a toast, not this component.
 */
export function ErrorState({
	title = "No se pudieron cargar los datos",
	description,
	onRetry,
	className,
}: ErrorStateProps) {
	return (
		<div
			className={cn(
				"flex flex-col items-center justify-center gap-3 px-4 py-10 text-center",
				className,
			)}
			role="alert"
		>
			<div
				className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive"
				aria-hidden="true"
			>
				<AlertTriangle className="h-7 w-7" />
			</div>
			<div className="space-y-1">
				<p className="text-base font-semibold">{title}</p>
				{description ? (
					<p className="max-w-sm text-sm text-(--v2-ink-soft)">{description}</p>
				) : null}
			</div>
			{onRetry ? (
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={onRetry}
				>
					Reintentar
				</Button>
			) : null}
		</div>
	);
}
