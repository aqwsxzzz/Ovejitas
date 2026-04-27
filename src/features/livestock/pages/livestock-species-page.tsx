import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";

import { useGetUserProfile } from "@/features/auth/api/auth-queries";
import {
	useGetLivestockAssetById,
	useListIndividualsByAssetId,
} from "@/features/livestock/api/livestock-queries";
import type { ILivestockIndividual } from "@/features/livestock/types/livestock-types";

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
				aria-label="Buscar individuos por nombre o tag"
			/>
		</div>
	);
}

function SpeciesAnimalRow({ animal }: { animal: ILivestockIndividual }) {
	return (
		<div className="rounded-xl border border-[color:var(--v2-border)] bg-white p-3">
			<div className="flex items-start justify-between gap-3">
				<div className="min-w-0">
					<p className="font-medium leading-tight">
						{animal.name ?? "Sin nombre"}
					</p>
					<p className="mt-0.5 text-xs text-[color:var(--v2-ink-soft)]">
						{animal.tag}
						{animal.extra?.sex
							? ` · ${SEX_SYMBOL[animal.extra.sex as string] ?? "–"}`
							: ""}
						{animal.status ? ` · ${animal.status}` : ""}
					</p>
				</div>
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
	const { data: currentUser } = useGetUserProfile();
	const farmId = currentUser?.lastVisitedFarmId ?? "";
	const assetId = Number(speciesKey);
	const isValidAssetId = Number.isInteger(assetId);

	const { data: asset } = useGetLivestockAssetById({
		farmId,
		assetId,
		enabled: !!farmId && isValidAssetId,
	});

	const { data: individualsResponse, isLoading } = useListIndividualsByAssetId({
		farmId,
		assetId: speciesKey,
		filters: { pageSize: 100 },
		enabled: !!farmId && isValidAssetId && asset?.mode === "individual",
	});

	const animals = individualsResponse?.data ?? [];
	const filteredAnimals = useMemo(() => {
		if (!query.trim()) return animals;
		const normalizedQuery = query.toLowerCase();
		return animals.filter(
			(animal) =>
				(animal.name ?? "").toLowerCase().includes(normalizedQuery) ||
				animal.tag.toLowerCase().includes(normalizedQuery),
		);
	}, [animals, query]);

	if (!farmId) {
		return (
			<section className="space-y-4">
				<div className="v2-card p-5">
					<p className="v2-kicker">Ganado</p>
					<h1 className="mt-2 text-xl font-semibold">Selecciona una granja</h1>
					<p className="mt-1 text-sm text-[color:var(--v2-ink-soft)]">
						No hay granja activa para cargar datos reales.
					</p>
				</div>
			</section>
		);
	}

	if (!asset) {
		return (
			<section className="space-y-4">
				<div className="v2-card p-5">
					<p className="v2-kicker">Ganado</p>
					<h1 className="mt-2 text-xl font-semibold">Lote no encontrado</h1>
					<p className="mt-1 text-sm text-[color:var(--v2-ink-soft)]">
						No encontramos un lote real para el id solicitado.
					</p>
					<Link
						to="/v2/production-units"
						className="mt-4 inline-flex rounded-full border border-[color:var(--v2-ink)] px-3 py-1.5 text-xs font-semibold"
					>
						Volver a lotes
					</Link>
				</div>
			</section>
		);
	}

	return (
		<section className="space-y-4">
			<div className="v2-card p-5">
				<p className="v2-kicker">Ganado</p>
				<div className="mt-2 flex flex-wrap items-center justify-between gap-3">
					<div>
						<div className="flex items-center gap-2">
							<h1 className="text-xl font-semibold">🐔 {asset.name}</h1>
							<span
								className={`rounded-full px-2 py-0.5 text-xs font-medium ${
									asset.mode === "individual"
										? "bg-blue-50 text-blue-700"
										: "bg-(--v2-surface) text-(--v2-ink-soft)"
								}`}
							>
								{asset.mode === "individual" ? "Individual" : "Agrupado"}
							</span>
						</div>
						<p className="mt-1 text-sm text-[color:var(--v2-ink-soft)]">
							{asset.mode === "individual"
								? `${animals.length} individuos en este lote`
								: "Lote agrupado — el conteo se registra por eventos"}
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

			{asset.mode === "aggregated" ? (
				<div className="v2-card p-5">
					<p className="text-sm text-[color:var(--v2-ink-soft)]">
						Este lote es agrupado. Los individuos solo se pueden crear en lotes
						de modo individual.
					</p>
				</div>
			) : (
				<>
					<SpeciesSearchBar
						value={query}
						onChange={setQuery}
					/>

					<div className="space-y-2">
						{isLoading ? (
							<p className="text-sm text-[color:var(--v2-ink-soft)]">
								Cargando individuos...
							</p>
						) : filteredAnimals.length === 0 ? (
							<p className="text-sm text-[color:var(--v2-ink-soft)]">
								No hay individuos que coincidan con "{query}".
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
				</>
			)}
		</section>
	);
}
