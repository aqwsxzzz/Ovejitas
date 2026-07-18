import type { ReactNode } from "react";
import { Loader2 } from "lucide-react";

export type MetricBreakdownTone = "default" | "positive" | "negative" | "muted";

export interface MetricBreakdownRow {
	label: string;
	value: string;
	tone?: MetricBreakdownTone;
}

interface MetricBreakdownCardProps {
	label: string;
	value: string;
	isLoading?: boolean;
	/** Right-aligned slot next to the headline (e.g. an action button). */
	action?: ReactNode;
	/** Optional line-item breakdown, rendered as aligned label → value rows. */
	breakdown?: MetricBreakdownRow[];
	/** Muted lines under the breakdown (warnings, exclusions, empty-state hints). */
	footnotes?: string[];
	/** Extra content below (e.g. an inline edit form). */
	children?: ReactNode;
}

const TONE_CLASS: Record<MetricBreakdownTone, string> = {
	default: "",
	positive: "text-success",
	negative: "text-destructive",
	muted: "text-(--v2-ink-soft)",
};

/**
 * Shared metric card: a headline value with an optional aligned breakdown,
 * footnotes, an action slot, and arbitrary children. One visual language for
 * "stat with breakdown" across features.
 */
export function MetricBreakdownCard({
	label,
	value,
	isLoading,
	action,
	breakdown,
	footnotes,
	children,
}: MetricBreakdownCardProps) {
	return (
		<div className="v2-card flex-1 p-3">
			<div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
				<div className="min-w-0">
					<p className="text-[10px] uppercase tracking-[0.08em] text-(--v2-ink-soft)">
						{label}
					</p>
					<p className="mt-1 text-2xl font-semibold leading-none wrap-break-word">
						{isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : value}
					</p>
				</div>
				{action ? <div className="ml-auto shrink-0">{action}</div> : null}
			</div>

			{breakdown && breakdown.length > 0 ? (
				<dl className="mt-3 space-y-1 border-t border-(--v2-border) pt-3">
					{breakdown.map((row) => (
						<div
							key={row.label}
							className="flex items-baseline justify-between gap-3 text-sm"
						>
							<dt className="min-w-0 text-(--v2-ink-soft)">{row.label}</dt>
							<dd
								className={`shrink-0 whitespace-nowrap font-medium tabular-nums ${TONE_CLASS[row.tone ?? "default"]}`}
							>
								{row.value}
							</dd>
						</div>
					))}
				</dl>
			) : null}

			{footnotes && footnotes.length > 0 ? (
				<div className="mt-2 space-y-0.5">
					{footnotes.map((note) => (
						<p
							key={note}
							className="text-xs text-(--v2-ink-soft)"
						>
							{note}
						</p>
					))}
				</div>
			) : null}

			{children}
		</div>
	);
}
