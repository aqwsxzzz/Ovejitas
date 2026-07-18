import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/features/reports/utils/reports-format";

export interface CurrencyNetEntry {
	/** Null for genuinely unpriced feed with no ledger currency. */
	currency: string | null;
	income: string;
	directExpense: string;
	/** Income − direct expense. */
	net: string;
	/** Consumed feed cost, valued in this currency. */
	feed: string;
	/** Income − (direct expense + feed). */
	netInclFeed: string;
	hasUnvaluedConsumption?: boolean;
}

interface CurrencyNetBlockProps {
	entry: CurrencyNetEntry;
}

/** One currency's net, collapsible to its income / expense / feed breakdown. */
export function CurrencyNetBlock({ entry }: CurrencyNetBlockProps) {
	const [open, setOpen] = useState(false);
	const headlineTone =
		Number(entry.netInclFeed) >= 0 ? "text-success" : "text-destructive";
	const label = entry.currency ?? "Sin moneda";

	return (
		<div className="rounded-lg border border-(--v2-border)">
			<Button
				type="button"
				variant="ghost"
				onClick={() => setOpen((previous) => !previous)}
				className="flex h-auto w-full items-center justify-between gap-3 px-3 py-2 text-left font-normal"
			>
				<span className="flex items-center gap-2">
					{open ? (
						<ChevronDown className="h-4 w-4 text-(--v2-ink-soft)" />
					) : (
						<ChevronRight className="h-4 w-4 text-(--v2-ink-soft)" />
					)}
					<span className="font-mono text-xs font-semibold">{label}</span>
				</span>
				<span className={`font-semibold tabular-nums ${headlineTone}`}>
					{formatCurrency(entry.netInclFeed, entry.currency)}
				</span>
			</Button>

			{open ? (
				<dl className="space-y-1 border-t border-(--v2-border) px-3 py-2 text-sm">
					<Row
						label="Ingresos"
						value={formatCurrency(entry.income, entry.currency)}
						tone="text-success"
					/>
					<Row
						label="Gasto directo"
						value={formatCurrency(entry.directExpense, entry.currency)}
						tone="text-destructive"
					/>
					<Row
						label="Alimento"
						value={formatCurrency(entry.feed, entry.currency)}
						tone="text-destructive"
					/>
					<Row
						label="Neto real"
						value={formatCurrency(entry.netInclFeed, entry.currency)}
						tone={headlineTone}
					/>
					{entry.hasUnvaluedConsumption ? (
						<p className="pt-1 text-xs text-(--v2-ink-soft)">
							Alimento sin costo registrado: el neto puede estar sobrestimado.
						</p>
					) : null}
				</dl>
			) : null}
		</div>
	);
}

function Row({
	label,
	value,
	tone,
}: {
	label: string;
	value: string;
	tone: string;
}) {
	return (
		<div className="flex items-baseline justify-between gap-3">
			<dt className="min-w-0 text-(--v2-ink-soft)">{label}</dt>
			<dd className={`shrink-0 whitespace-nowrap font-medium tabular-nums ${tone}`}>
				{value}
			</dd>
		</div>
	);
}
