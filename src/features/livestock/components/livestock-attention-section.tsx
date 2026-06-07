import type { LivestockIndividual } from "@/shared/types/v2-domain-types";

interface LivestockAttentionSectionProps {
	items: LivestockIndividual[];
}

const ATTENTION_STYLES = {
	overdue: {
		border: "border-destructive/30",
		bg: "bg-destructive/10",
		pill: "bg-destructive/15 text-destructive",
		label: "VENCIDO",
	},
	watch: {
		border: "border-warning/30",
		bg: "bg-warning/10",
		pill: "bg-warning/15 text-warning",
		label: "VIGILAR",
	},
} as const;

function AttentionCard({ animal }: { animal: LivestockIndividual }) {
	const style =
		ATTENTION_STYLES[animal.attention ?? "watch"] ?? ATTENTION_STYLES.watch;

	return (
		<div
			className={`flex items-center justify-between rounded-xl border px-4 py-3 ${style.border} ${style.bg}`}
		>
			<div className="min-w-0">
				<p className="font-semibold leading-tight">
					{animal.name}
					<span className="ml-1.5 text-[color:var(--v2-ink-soft)] font-normal text-sm">
						· {animal.tag}
					</span>
				</p>
				{animal.attentionNote && (
					<p className="mt-0.5 text-sm text-[color:var(--v2-ink-soft)]">
						{animal.attentionNote}
					</p>
				)}
			</div>
			<span
				className={`ml-3 shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-wide ${style.pill}`}
			>
				{style.label}
			</span>
		</div>
	);
}

export function LivestockAttentionSection({
	items,
}: LivestockAttentionSectionProps) {
	if (items.length === 0) return null;

	return (
		<div className="space-y-2">
			<p className="v2-kicker">Requieren atencion</p>
			{items.map((animal) => (
				<AttentionCard
					key={animal.id}
					animal={animal}
				/>
			))}
		</div>
	);
}
