import type { ILivestockIndividual } from "@/features/livestock/types/livestock-types";

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
				className="flex h-16 w-32 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50"
				aria-hidden="true"
			/>
		);
	}

	const sex = (individual.extra?.sex as string | undefined) ?? "unknown";
	const sexSymbol = { male: "♂", female: "♀", unknown: "–" }[sex] ?? "–";

	return (
		<button
			onClick={onClick}
			className={`flex h-16 w-32 flex-col items-center justify-center rounded-lg border-2 px-2 py-1 text-center transition-colors ${
				isHighlighted
					? "border-blue-500 bg-blue-50"
					: "border-gray-300 bg-white hover:border-blue-300"
			}`}
		>
			<div className="truncate text-sm font-semibold">
				{individual.name || individual.tag}
			</div>
			<div className="text-xs text-gray-600">{sexSymbol}</div>
		</button>
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
			return "⚠️ Inbreeding detected in lineage";
		}
		return null;
	})();

	return (
		<div className="space-y-6">
			{inbreedingWarning && (
				<div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
					{inbreedingWarning}
				</div>
			)}

			{/* Grandparents */}
			<div className="flex justify-between gap-2">
				<div>
					<div className="mb-2 text-xs font-semibold text-gray-600">
						Grandparents (Maternal)
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
					<div className="mb-2 text-xs font-semibold text-gray-600">
						Grandparents (Paternal)
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
					<div className="mb-2 text-xs font-semibold text-gray-600">Mother</div>
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
					<div className="mb-2 text-xs font-semibold text-gray-600">Father</div>
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
			<div className="flex justify-center rounded-lg border-3 border-blue-600 bg-blue-50 p-4">
				<div className="text-center">
					<div className="text-lg font-bold text-blue-900">
						{individual.name || individual.tag}
					</div>
					<div className="text-sm text-blue-700">
						{(individual.extra?.sex as string | undefined) === "male"
							? "♂ Male"
							: (individual.extra?.sex as string | undefined) === "female"
								? "♀ Female"
								: "– Unknown"}
					</div>
					{individual.birth_date && (
						<div className="text-xs text-blue-600">
							{new Date(individual.birth_date).toLocaleDateString()}
						</div>
					)}
				</div>
			</div>

			{/* No Parents Info */}
			{!mother && !father && (
				<div className="text-center text-sm text-gray-500">
					No genealogy information recorded
				</div>
			)}
		</div>
	);
}
