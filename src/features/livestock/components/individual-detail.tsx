import { useMemo, useState } from "react";
import type { ILivestockIndividual } from "@/features/livestock/types/livestock-types";
import { GenealogyTree } from "./genealogy-tree";
import { IndividualForm } from "./individual-form.tsx";
import type { IndividualFormData } from "./individual-form.tsx";

interface IndividualDetailProps {
	individual: ILivestockIndividual;
	allIndividuals: ILivestockIndividual[];
	onUpdate?: (updated: ILivestockIndividual) => Promise<void>;
	onDelete?: () => Promise<void>;
	isLoading?: boolean;
}

export function IndividualDetail({
	individual,
	allIndividuals,
	onUpdate,
	onDelete,
	isLoading = false,
}: IndividualDetailProps) {
	const [isEditingGenealogy, setIsEditingGenealogy] = useState(false);
	const [selectedAncestorId, setSelectedAncestorId] = useState<
		number | undefined
	>();

	// Build individual lookup map for genealogy
	const individualsMap = useMemo(() => {
		const map = new Map<number, ILivestockIndividual>();
		allIndividuals.forEach((ind) => map.set(ind.id, ind));
		return map;
	}, [allIndividuals]);

	const handleUpdateGenealogy = async (data: IndividualFormData) => {
		if (!onUpdate) return;

		const updated: ILivestockIndividual = {
			...individual,
			name: data.name ?? individual.name,
			tag: data.tag,
			birth_date: data.birthDate ?? individual.birth_date,
			mother_id:
				data.motherId != null ? Number(data.motherId) : individual.mother_id,
			father_id:
				data.fatherId != null ? Number(data.fatherId) : individual.father_id,
			status: (data.status ??
				individual.status) as ILivestockIndividual["status"],
			extra: {
				...individual.extra,
				...(data.sex !== undefined ? { sex: data.sex } : {}),
			},
		};

		await onUpdate(updated);
		setIsEditingGenealogy(false);
	};

	const handleDelete = async () => {
		if (
			confirm(
				`Delete ${individual.name || individual.tag}? This cannot be undone.`,
			)
		) {
			await onDelete?.();
		}
	};

	const statusColor =
		(
			{
				active: "text-green-700",
				sold: "text-amber-700",
				deceased: "text-red-700",
			} as Record<string, string>
		)[individual.status] ?? "text-gray-700";

	const statusBg =
		(
			{
				active: "bg-green-50",
				sold: "bg-amber-50",
				deceased: "bg-red-50",
			} as Record<string, string>
		)[individual.status] ?? "bg-gray-50";

	const sex = (individual.extra?.sex as string | undefined) ?? "unknown";
	const sexSymbol = { male: "♂", female: "♀", unknown: "–" }[sex] ?? "–";

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="rounded-lg border border-gray-200 bg-white p-6">
				<div className="flex items-start justify-between gap-4">
					<div>
						<h1 className="text-3xl font-bold">
							{individual.name || individual.tag}
						</h1>
						<p className="mt-1 text-gray-600">Tag: {individual.tag}</p>
					</div>
					<div className="text-right">
						<div
							className={`inline-block rounded-full px-3 py-1 text-sm font-semibold ${statusColor} ${statusBg}`}
						>
							{individual.status.charAt(0).toUpperCase() +
								individual.status.slice(1)}
						</div>
					</div>
				</div>

				{/* Quick Info Grid */}
				<div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
					<div>
						<p className="text-xs uppercase text-gray-600">Sex</p>
						<p className="mt-1 text-lg font-semibold">
							{sex === "male"
								? `Male ${sexSymbol}`
								: sex === "female"
									? `Female ${sexSymbol}`
									: `Unknown ${sexSymbol}`}
						</p>
					</div>

					<div>
						<p className="text-xs uppercase text-gray-600">Birth Date</p>
						<p className="mt-1 text-lg font-semibold">
							{individual.birth_date
								? new Date(individual.birth_date).toLocaleDateString()
								: "Unknown"}
						</p>
					</div>

					<div>
						<p className="text-xs uppercase text-gray-600">Created</p>
						<p className="mt-1 text-lg font-semibold">
							{new Date(individual.created_at).toLocaleDateString()}
						</p>
					</div>

					<div>
						<p className="text-xs uppercase text-gray-600">Updated</p>
						<p className="mt-1 text-lg font-semibold">
							{new Date(individual.updated_at).toLocaleDateString()}
						</p>
					</div>
				</div>

				{/* Actions */}
				<div className="mt-6 flex gap-2">
					<button
						onClick={() => setIsEditingGenealogy(!isEditingGenealogy)}
						className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
					>
						{isEditingGenealogy ? "Cancel Edit" : "Edit Genealogy"}
					</button>
					<button
						onClick={handleDelete}
						disabled={isLoading}
						className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
					>
						Delete
					</button>
				</div>
			</div>

			{/* Genealogy Section */}
			<div className="rounded-lg border border-gray-200 bg-white p-6">
				<h2 className="mb-4 text-xl font-bold">Genealogy</h2>

				{isEditingGenealogy ? (
					<div className="rounded-lg bg-blue-50 p-4">
						<h3 className="mb-4 font-semibold text-blue-900">Edit Genealogy</h3>
						<IndividualForm
							individual={individual}
							availableParents={allIndividuals}
							onSubmit={handleUpdateGenealogy}
							onCancel={() => setIsEditingGenealogy(false)}
							isLoading={isLoading}
						/>
					</div>
				) : (
					<GenealogyTree
						individual={individual}
						individuals={individualsMap}
						onSelectIndividual={(selected) =>
							setSelectedAncestorId(selected.id)
						}
						selectedId={selectedAncestorId}
					/>
				)}
			</div>

			{/* Extra metadata (if any) */}
			{Object.keys(individual.extra).length > 0 && (
					<div className="rounded-lg border border-gray-200 bg-white p-6">
						<h2 className="mb-4 text-xl font-bold">Metadata</h2>
						<div className="space-y-2">
							{Object.entries(individual.extra).map(([key, value]) => (
								<div
									key={key}
									className="flex justify-between"
								>
									<span className="text-gray-600">{key}</span>
									<span className="font-semibold">{String(value)}</span>
								</div>
							))}
						</div>
					</div>
				)}
		</div>
	);
}
