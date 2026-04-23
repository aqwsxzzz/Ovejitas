import { useMemo, useState } from "react";

import { useGetUserProfile } from "@/features/auth/api/auth-queries";
import { useListLivestockAssetsByFarmId } from "@/features/livestock/api/livestock-queries";
import { listLivestockGroups } from "@/shared/api/v2-mock-repository";
import type {
	LivestockGroup,
	LivestockIndividual,
} from "@/shared/types/v2-domain-types";

import { LivestockAttentionSection } from "../components/livestock-attention-section";
import { LivestockSpeciesAccordion } from "../components/livestock-species-accordion";

// ─── Search bar ───────────────────────────────────────────────────────────────

interface SearchBarProps {
	value: string;
	onChange: (v: string) => void;
}

function SearchBar({ value, onChange }: SearchBarProps) {
	return (
		<div className="flex items-center gap-2 rounded-xl border border-dashed border-[color:var(--v2-border)] bg-white px-3 py-2.5">
			<span
				className="text-base"
				aria-hidden="true"
			>
				🔍
			</span>
			<input
				type="search"
				value={value}
				onChange={(e) => onChange(e.target.value)}
				placeholder="Buscar por nombre o tag..."
				className="flex-1 bg-transparent text-sm outline-none placeholder:text-[color:var(--v2-ink-soft)]"
				aria-label="Buscar animales por nombre o tag"
			/>
		</div>
	);
}

// ─── Flat search results ──────────────────────────────────────────────────────

const ATTENTION_BAR: Record<string, string> = {
	overdue: "bg-red-500",
	watch: "bg-amber-400",
};

function SearchResultRow({ animal }: { animal: LivestockIndividual }) {
	const barColor = animal.attention
		? (ATTENTION_BAR[animal.attention] ?? "bg-[color:var(--v2-border)]")
		: "bg-[color:var(--v2-border)]";

	return (
		<div className="v2-card flex overflow-hidden">
			<div className={`w-1.5 shrink-0 ${barColor}`} />
			<div className="flex-1 px-4 py-3">
				<div className="flex items-center justify-between">
					<p className="font-semibold">{animal.name}</p>
					<span className="text-xs text-[color:var(--v2-ink-soft)]">
						{animal.tag} · {animal.icon}
					</span>
				</div>
				{animal.attentionNote && (
					<p className="mt-0.5 text-sm text-[color:var(--v2-ink-soft)]">
						{animal.attentionNote}
					</p>
				)}
			</div>
		</div>
	);
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function LivestockPage() {
	const [query, setQuery] = useState("");
	const { data: currentUser } = useGetUserProfile();
	const farmId = currentUser?.lastVisitedFarmId ?? "";
	const { data: farmAssetsResponse } = useListLivestockAssetsByFarmId({
		farmId,
		filters: {
			kind: "animal",
			mode: "aggregated",
			page: 1,
			pageSize: 100,
		},
		enabled: !!farmId,
	});

	const allGroups = useMemo(() => listLivestockGroups(), []);
	const individualGroups = allGroups.filter(
		(group) => group.mode === "individual",
	);
	const mockGroupedUnits = allGroups.filter(
		(group) => group.mode === "aggregate",
	);

	const backendGroupedUnits = useMemo<LivestockGroup[]>(() => {
		if (!farmAssetsResponse?.data.length) {
			return [];
		}

		return farmAssetsResponse.data.map((asset) => ({
			categoryKey: String(asset.id),
			mode: "aggregate",
			title: asset.name,
			subtitle: asset.location ?? "Sin ubicacion",
			categoryLabel: "Lote",
			icon: "🐔",
			totalCount: 0,
			attentionItems: [],
			healthyItems: [],
		}));
	}, [farmAssetsResponse]);

	const groupedUnits =
		backendGroupedUnits.length > 0 ? backendGroupedUnits : mockGroupedUnits;

	const totalCount = allGroups.reduce((sum, g) => sum + g.totalCount, 0);
	const attentionItems = individualGroups.flatMap(
		(group) => group.attentionItems,
	);

	const searchResults = useMemo(() => {
		if (!query.trim()) return null;
		const q = query.toLowerCase();
		return individualGroups
			.flatMap((g) => [...g.attentionItems, ...g.healthyItems])
			.filter(
				(a) =>
					a.name.toLowerCase().includes(q) || a.tag.toLowerCase().includes(q),
			);
	}, [query, individualGroups]);

	return (
		<section className="space-y-4">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-semibold">Ganado</h1>
					<p className="text-sm text-[color:var(--v2-ink-soft)]">
						{totalCount} total · {attentionItems.length} requieren atencion
					</p>
				</div>
			</div>

			<SearchBar
				value={query}
				onChange={setQuery}
			/>

			{searchResults ? (
				<div className="space-y-2">
					{searchResults.length === 0 ? (
						<p className="text-sm text-[color:var(--v2-ink-soft)]">
							No hay animales que coincidan con "{query}".
						</p>
					) : (
						searchResults.map((animal) => (
							<SearchResultRow
								key={animal.id}
								animal={animal}
							/>
						))
					)}
				</div>
			) : (
				<>
					<LivestockAttentionSection items={attentionItems} />
					<LivestockSpeciesAccordion
						title="Individuales"
						groups={individualGroups}
					/>
					<LivestockSpeciesAccordion
						title="Lotes"
						groups={groupedUnits}
					/>
				</>
			)}
		</section>
	);
}
