import { Button } from "@/components/ui/button";
import type { ILivestockIndividual } from "@/features/livestock/types/livestock-types";

function formatIndividualLabel(individual: ILivestockIndividual): string {
	const tag = individual.tag?.trim() || `#${individual.id}`;
	const name = individual.name?.trim();
	return name ? `${tag} (${name})` : tag;
}

function getIndividualTag(individual: ILivestockIndividual): string {
	return individual.tag?.trim() || `#${individual.id}`;
}

function getIndividualName(individual: ILivestockIndividual): string | null {
	const name = individual.name?.trim();
	return name || null;
}

interface GenealogyCellProps {
	individual: ILivestockIndividual | null;
	isHighlighted?: boolean;
	onClick?: () => void;
}

function GenealogyCellComponent({
	individual,
	isHighlighted,
	onClick,
}: GenealogyCellProps) {
	if (!individual) {
		return (
			<div
				className="flex h-16 w-32 items-center justify-center rounded-lg border-2 border-dashed border-input bg-muted"
				aria-hidden="true"
			/>
		);
	}

	const sex = (individual.extra?.sex as string | undefined) ?? "unknown";
	const sexSymbol = { male: "♂", female: "♀", unknown: "–" }[sex] ?? "–";
	const tag = getIndividualTag(individual);
	const name = getIndividualName(individual);

	return (
		<Button
			variant="outline"
			onClick={onClick}
			className={`flex h-16 w-32 flex-col items-center justify-center gap-0 rounded-lg border-2 px-2 py-1 text-center ${
				isHighlighted
					? "border-info bg-info/10"
					: "border-input bg-white hover:border-info"
			}`}
		>
			<div className="truncate text-sm font-semibold">{tag}</div>
			<div className="truncate text-xs text-muted-foreground">
				{name ? name : sexSymbol}
			</div>
		</Button>
	);
}

interface GenealogyTreeProps {
	individual: ILivestockIndividual;
	individuals: Map<number, ILivestockIndividual>;
	/** Callback when clicking an individual in the tree */
	onSelectIndividual?: (individual: ILivestockIndividual) => void;
	/** ID of currently selected individual */
	selectedId?: number;
}

/**
 * Displays a genealogy tree with the subject at the bottom
 * and parents/grandparents above in a pyramid structure
 */
export function GenealogyTree({
	individual,
	individuals,
	onSelectIndividual,
	selectedId,
}: GenealogyTreeProps) {
	const subjectLabel = formatIndividualLabel(individual);

	// Build the tree structure
	const mother = individual.mother_id
		? individuals.get(individual.mother_id)
		: null;
	const father = individual.father_id
		? individuals.get(individual.father_id)
		: null;

	const maternalGrandmother = mother?.mother_id
		? individuals.get(mother.mother_id)
		: null;
	const maternalGrandfather = mother?.father_id
		? individuals.get(mother.father_id)
		: null;
	const paternalGrandmother = father?.mother_id
		? individuals.get(father.mother_id)
		: null;
	const paternalGrandfather = father?.father_id
		? individuals.get(father.father_id)
		: null;

	// Check for inbreeding (same individual appears multiple times in ancestry)
	const inbreedingWarning = (() => {
		const ancestors = [
			mother?.id,
			father?.id,
			maternalGrandmother?.id,
			maternalGrandfather?.id,
			paternalGrandmother?.id,
			paternalGrandfather?.id,
		].filter((id): id is number => id != null);

		const uniqueAncestors = new Set(ancestors);
		if (uniqueAncestors.size < ancestors.length) {
			return "⚠️ Se detecto consanguinidad en el linaje";
		}
		return null;
	})();

	return (
		<div className="space-y-6">
			{inbreedingWarning && (
				<div className="rounded-lg border border-warning/30 bg-warning/10 p-3 text-sm text-warning">
					{inbreedingWarning}
				</div>
			)}

			{/* Grandparents */}
			<div className="flex justify-between gap-2">
				<div>
					<div className="mb-2 text-xs font-semibold text-muted-foreground">
						Abuelos (maternos)
					</div>
					<div className="flex gap-2">
						{maternalGrandmother ? (
							<GenealogyCellComponent
								individual={maternalGrandmother}
								isHighlighted={selectedId === maternalGrandmother.id}
								onClick={() => onSelectIndividual?.(maternalGrandmother)}
							/>
						) : (
							<GenealogyCellComponent individual={null} />
						)}
						{maternalGrandfather ? (
							<GenealogyCellComponent
								individual={maternalGrandfather}
								isHighlighted={selectedId === maternalGrandfather.id}
								onClick={() => onSelectIndividual?.(maternalGrandfather)}
							/>
						) : (
							<GenealogyCellComponent individual={null} />
						)}
					</div>
				</div>

				<div>
					<div className="mb-2 text-xs font-semibold text-muted-foreground">
						Abuelos (paternos)
					</div>
					<div className="flex gap-2">
						{paternalGrandmother ? (
							<GenealogyCellComponent
								individual={paternalGrandmother}
								isHighlighted={selectedId === paternalGrandmother.id}
								onClick={() => onSelectIndividual?.(paternalGrandmother)}
							/>
						) : (
							<GenealogyCellComponent individual={null} />
						)}
						{paternalGrandfather ? (
							<GenealogyCellComponent
								individual={paternalGrandfather}
								isHighlighted={selectedId === paternalGrandfather.id}
								onClick={() => onSelectIndividual?.(paternalGrandfather)}
							/>
						) : (
							<GenealogyCellComponent individual={null} />
						)}
					</div>
				</div>
			</div>

			{/* Parents */}
			<div className="flex justify-center gap-16">
				<div>
					<div className="mb-2 text-xs font-semibold text-muted-foreground">Madre</div>
					{mother ? (
						<GenealogyCellComponent
							individual={mother}
							isHighlighted={selectedId === mother.id}
							onClick={() => onSelectIndividual?.(mother)}
						/>
					) : (
						<GenealogyCellComponent individual={null} />
					)}
				</div>

				<div>
					<div className="mb-2 text-xs font-semibold text-muted-foreground">Padre</div>
					{father ? (
						<GenealogyCellComponent
							individual={father}
							isHighlighted={selectedId === father.id}
							onClick={() => onSelectIndividual?.(father)}
						/>
					) : (
						<GenealogyCellComponent individual={null} />
					)}
				</div>
			</div>

			{/* Subject */}
			<div className="flex justify-center rounded-lg border-3 border-info bg-info/10 p-4">
				<div className="text-center">
					<div className="text-lg font-bold text-info">{subjectLabel}</div>
					<div className="text-sm text-info">
						{(individual.extra?.sex as string | undefined) === "male"
							? "♂ Macho"
							: (individual.extra?.sex as string | undefined) === "female"
								? "♀ Hembra"
								: "– Desconocido"}
					</div>
					{individual.birth_date && (
						<div className="text-xs text-info">
							{new Date(individual.birth_date).toLocaleDateString()}
						</div>
					)}
				</div>
			</div>

			{/* No Parents Info */}
			{!mother && !father && (
				<div className="text-center text-sm text-muted-foreground">
					No hay informacion genealogica registrada
				</div>
			)}
		</div>
	);
}
