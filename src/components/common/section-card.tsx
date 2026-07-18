import type { ReactNode } from "react";

interface SectionCardProps {
	title: string;
	description?: string;
	/** Right-aligned header slot (badges, toggles, actions). Wraps below on narrow widths. */
	action?: ReactNode;
	children?: ReactNode;
}

/**
 * Shared shell for interactive panels: a card with a title/description header,
 * a right-aligned action slot, and a body. The header is overflow-hardened —
 * the title can shrink/wrap while the action stays right and drops to its own
 * line when there is no room, so personalized content never collapses the layout.
 */
export function SectionCard({
	title,
	description,
	action,
	children,
}: SectionCardProps) {
	return (
		<section className="v2-card flex flex-col gap-4 p-4">
			<div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
				<div className="min-w-0">
					<p className="v2-kicker">{title}</p>
					{description ? (
						<p className="mt-1 text-sm text-(--v2-ink-soft)">{description}</p>
					) : null}
				</div>
				{action ? (
					<div className="ml-auto flex shrink-0 items-center gap-2">
						{action}
					</div>
				) : null}
			</div>
			{children}
		</section>
	);
}
