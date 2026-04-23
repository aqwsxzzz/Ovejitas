import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";

import { listLivestockGroups } from "@/shared/api/v2-mock-repository";
import type { LivestockIndividual } from "@/shared/types/v2-domain-types";

const ATTENTION_STYLES: Record<string, string> = {
	overdue: "border-red-200 bg-red-50",
	watch: "border-amber-200 bg-amber-50",
};

const ATTENTION_LABELS: Record<string, string> = {
	overdue: "VENCIDO",
	watch: "VIGILAR",
};

const SEX_SYMBOL: Record<string, string> = {
	male: "♂",
	female: "♀",
	unknown: "–",
};

interface SpeciesSearchBarProps {
	value: string;
	onChange: (value: string) => void;
}

function SpeciesSearchBar({ value, onChange }: SpeciesSearchBarProps) {
	return (
		<div className="v2-card flex items-center gap-2 px-3 py-2.5">
			<span
				className="text-base"
				aria-hidden="true"
			>
				🔍
			</span>
			<input
				type="search"
				value={value}
				onChange={(event) => onChange(event.target.value)}
				placeholder="Buscar por nombre o tag..."
				className="flex-1 bg-transparent text-sm outline-none placeholder:text-[color:var(--v2-ink-soft)]"
				aria-label="Buscar animales de esta especie por nombre o tag"
			/>
		</div>
	);
}

function SpeciesAnimalRow({ animal }: { animal: LivestockIndividual }) {
	const toneClass = animal.attention
		? (ATTENTION_STYLES[animal.attention] ??
			"border-[color:var(--v2-border)] bg-white")
		: "border-[color:var(--v2-border)] bg-white";

	return (
		<div className={`rounded-xl border p-3 ${toneClass}`}>
			<div className="flex items-start justify-between gap-3">
				<div className="min-w-0">
					<p className="font-medium leading-tight">{animal.name}</p>
					<p className="mt-0.5 text-xs text-[color:var(--v2-ink-soft)]">
						{animal.tag}
						{animal.sex ? ` · ${SEX_SYMBOL[animal.sex] ?? "–"}` : ""}
					</p>
					{animal.attentionNote && (
						<p className="mt-1 text-sm text-[color:var(--v2-ink-soft)]">
							{animal.attentionNote}
						</p>
					)}
				</div>
				{animal.attention && (
					<span className="rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-bold tracking-wide text-[color:var(--v2-ink)]">
						{ATTENTION_LABELS[animal.attention]}
					</span>
				)}
			</div>
		</div>
	);
}

interface LivestockSpeciesPageProps {
	speciesKey: string;
}

export function LivestockSpeciesPage({
	speciesKey,
}: LivestockSpeciesPageProps) {
	const [query, setQuery] = useState("");
	const group = listLivestockGroups().find(
		(item) => item.categoryKey === speciesKey,
	);

	if (!group) {
		return (
			<section className="space-y-4">
				<div className="v2-card p-5">
					<p className="v2-kicker">Ganado</p>
					<h1 className="mt-2 text-xl font-semibold">Especie no encontrada</h1>
					<p className="mt-1 text-sm text-[color:var(--v2-ink-soft)]">
						No encontramos la especie solicitada.
					</p>
					<Link
						to="/v2/production-units"
						className="mt-4 inline-flex rounded-full border border-[color:var(--v2-ink)] px-3 py-1.5 text-xs font-semibold"
					>
						Volver a especies
					</Link>
				</div>
			</section>
		);
	}

	const animals = [...group.attentionItems, ...group.healthyItems];
	const filteredAnimals = useMemo(() => {
		if (!query.trim()) return animals;
		const normalizedQuery = query.toLowerCase();
		return animals.filter(
			(animal) =>
				animal.name.toLowerCase().includes(normalizedQuery) ||
				animal.tag.toLowerCase().includes(normalizedQuery),
		);
	}, [animals, query]);

	return (
		<section className="space-y-4">
			<div className="v2-card p-5">
				<p className="v2-kicker">Ganado</p>
				<div className="mt-2 flex flex-wrap items-center justify-between gap-3">
					<div>
						<h1 className="text-xl font-semibold">
							<span aria-hidden="true">{group.icon}</span>
							<span className="ml-2">{group.categoryLabel}</span>
						</h1>
						<p className="mt-1 text-sm text-[color:var(--v2-ink-soft)]">
							{animals.length} animales en esta especie
						</p>
					</div>
					<Link
						to="/v2/production-units"
						className="rounded-full border border-[color:var(--v2-ink)] px-3 py-1.5 text-xs font-semibold"
					>
						Volver
					</Link>
				</div>
			</div>

			<SpeciesSearchBar
				value={query}
				onChange={setQuery}
			/>

			<div className="space-y-2">
				{filteredAnimals.length === 0 ? (
					<p className="text-sm text-[color:var(--v2-ink-soft)]">
						No hay animales de esta especie que coincidan con "{query}".
					</p>
				) : (
					filteredAnimals.map((animal) => (
						<SpeciesAnimalRow
							key={animal.id}
							animal={animal}
						/>
					))
				)}
			</div>
		</section>
	);
}
