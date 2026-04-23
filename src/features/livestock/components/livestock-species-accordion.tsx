import { Link } from "@tanstack/react-router";

import type { LivestockGroup } from "@/shared/types/v2-domain-types";

interface LivestockSpeciesAccordionProps {
	title: string;
	groups: LivestockGroup[];
}

function SpeciesCard({ group }: { group: LivestockGroup }) {
	const cardBody = (
		<div className="flex items-center justify-between gap-3">
			<div className="min-w-0">
				<p className="font-semibold leading-tight">
					{group.icon} <span className="ml-2">{group.title}</span>
				</p>
				<p className="mt-1 text-sm text-[color:var(--v2-ink-soft)]">
					{group.subtitle}
				</p>
			</div>
			{group.mode === "individual" ? (
				<span
					className="text-sm text-[color:var(--v2-ink-soft)]"
					aria-hidden="true"
				>
					Ver lista ›
				</span>
			) : null}
		</div>
	);

	if (group.mode === "aggregate") {
		return (
			<Link
				to="/v2/production-units/flock/$unitId"
				params={{ unitId: group.categoryKey }}
				className="v2-card block p-4 transition hover:-translate-y-px"
			>
				{cardBody}
			</Link>
		);
	}

	return (
		<Link
			to="/v2/production-units/$speciesKey"
			params={{ speciesKey: group.categoryKey }}
			className="v2-card block p-4 transition hover:-translate-y-px"
		>
			{cardBody}
		</Link>
	);
}

export function LivestockSpeciesAccordion({
	title,
	groups,
}: LivestockSpeciesAccordionProps) {
	if (groups.length === 0) return null;

	return (
		<div className="space-y-2">
			<p className="v2-kicker">{title}</p>
			{groups.map((group) => (
				<SpeciesCard
					key={group.categoryKey}
					group={group}
				/>
			))}
		</div>
	);
}
