import { useMemo, useState } from "react";
import type { ILivestockIndividual } from "@/features/livestock/types/livestock-types";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { GenealogyTree } from "./genealogy-tree";
import { IndividualForm } from "./individual-form.tsx";
import type { IndividualFormData } from "./individual-form.tsx";

interface IndividualDetailProps {
	individual: ILivestockIndividual;
	allIndividuals: ILivestockIndividual[];
	onUpdate?: (updated: ILivestockIndividual) => Promise<void>;
	onDelete?: () => Promise<void>;
	isLoading?: boolean;
	startEditing?: boolean;
}

function formatIndividualLabel(individual: ILivestockIndividual): string {
	const tag = individual.tag?.trim() || `#${individual.id}`;
	const name = individual.name?.trim();
	return name ? `${tag} (${name})` : tag;
}

export function IndividualDetail({
	individual,
	allIndividuals,
	onUpdate,
	onDelete,
	isLoading = false,
	startEditing = false,
}: IndividualDetailProps) {
	const [isEditingGenealogy, setIsEditingGenealogy] = useState(startEditing);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [selectedAncestorId, setSelectedAncestorId] = useState<
		number | undefined
	>();
	const individualLabel = formatIndividualLabel(individual);

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
		await onDelete?.();
		setIsDeleteDialogOpen(false);
	};

	const statusLabel =
		(
			{
				active: "Activo",
				sold: "Vendido",
				deceased: "Fallecido",
				archived: "Archivado",
			} as Record<string, string>
		)[individual.status] ?? individual.status;

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
			<Dialog
				open={isDeleteDialogOpen}
				onOpenChange={setIsDeleteDialogOpen}
			>
				<DialogContent className="max-w-sm">
					<DialogHeader>
						<DialogTitle>Eliminar individuo</DialogTitle>
						<DialogDescription>
							Esta accion no se puede deshacer.
						</DialogDescription>
					</DialogHeader>
					<p className="text-sm text-gray-600">{individualLabel}</p>
					<DialogFooter>
						<button
							type="button"
							onClick={() => setIsDeleteDialogOpen(false)}
							className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium"
						>
							Cancelar
						</button>
						<button
							type="button"
							onClick={() => void handleDelete()}
							disabled={isLoading}
							className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
						>
							{isLoading ? "Eliminando..." : "Eliminar"}
						</button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
			{/* Header */}
			<div className="rounded-lg border border-gray-200 bg-white p-6">
				<div className="flex items-start justify-between gap-4">
					<div>
						<h1 className="text-3xl font-bold">{individualLabel}</h1>
					</div>
					<div className="text-right">
						<div
							className={`inline-block rounded-full px-3 py-1 text-sm font-semibold ${statusColor} ${statusBg}`}
						>
							{statusLabel}
						</div>
					</div>
				</div>

				{/* Quick Info Grid */}
				<div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
					<div>
						<p className="text-xs uppercase text-gray-600">Sexo</p>
						<p className="mt-1 text-lg font-semibold">
							{sex === "male"
								? `Macho ${sexSymbol}`
								: sex === "female"
									? `Hembra ${sexSymbol}`
									: `Desconocido ${sexSymbol}`}
						</p>
					</div>

					<div>
						<p className="text-xs uppercase text-gray-600">Nacimiento</p>
						<p className="mt-1 text-lg font-semibold">
							{individual.birth_date
								? new Date(individual.birth_date).toLocaleDateString()
								: "Desconocido"}
						</p>
					</div>

					<div>
						<p className="text-xs uppercase text-gray-600">Creado</p>
						<p className="mt-1 text-lg font-semibold">
							{new Date(individual.created_at).toLocaleDateString()}
						</p>
					</div>

					<div>
						<p className="text-xs uppercase text-gray-600">Actualizado</p>
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
						{isEditingGenealogy ? "Cancelar edicion" : "Editar genealogia"}
					</button>
					<button
						type="button"
						onClick={() => setIsDeleteDialogOpen(true)}
						disabled={isLoading}
						className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
					>
						Eliminar
					</button>
				</div>
			</div>

			{/* Genealogy Section */}
			<div className="rounded-lg border border-gray-200 bg-white p-6">
				<h2 className="mb-4 text-xl font-bold">Genealogia</h2>

				{isEditingGenealogy ? (
					<div className="rounded-lg bg-blue-50 p-4">
						<h3 className="mb-4 font-semibold text-blue-900">
							Editar genealogia
						</h3>
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
					<h2 className="mb-4 text-xl font-bold">Metadatos</h2>
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
