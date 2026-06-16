import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface EmptyStateProps {
	title: string;
	/** Optional supporting copy explaining the empty state or next step. */
	description?: string;
	/** Decorative illustration. Defaults to a friendly farm emoji. */
	illustration?: ReactNode;
	/** Optional call-to-action (e.g. a Button) rendered under the copy. */
	action?: ReactNode;
	className?: string;
}

/**
 * Standard "no data" placeholder: a centered illustration with a title,
 * optional description and an optional action. Use when a list or view has
 * nothing to show (genuinely empty, not loading and not an error).
 */
export function EmptyState({
	title,
	description,
	illustration,
	action,
	className,
}: EmptyStateProps) {
	return (
		<div
			className={cn(
				"flex flex-col items-center justify-center gap-3 px-4 py-10 text-center",
				className,
			)}
		>
			<div
				className="flex h-16 w-16 items-center justify-center rounded-full bg-(--v2-surface-raised) text-4xl"
				aria-hidden="true"
			>
				{illustration ?? "🐑"}
			</div>
			<div className="space-y-1">
				<p className="text-base font-semibold">{title}</p>
				{description ? (
					<p className="max-w-sm text-sm text-(--v2-ink-soft)">{description}</p>
				) : null}
			</div>
			{action ? <div className="pt-1">{action}</div> : null}
		</div>
	);
}
