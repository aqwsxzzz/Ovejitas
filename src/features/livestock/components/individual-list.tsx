import { useState } from "react";
import { IndividualForm } from "@/features/livestock/components/individual-form";
import type { IndividualFormData } from "@/features/livestock/components/individual-form";
import type { ILivestockIndividual } from "@/features/livestock/types/livestock-types";

const STATUS_COLORS = {
	active: "text-green-700 bg-green-50",
	sold: "text-amber-700 bg-amber-50",
	deceased: "text-red-700 bg-red-50",
};

const SEX_SYMBOL = {
	male: "♂",
	female: "♀",
	unknown: "–",
};

const STATUS_LABELS = {
	active: "Activo",
	sold: "Vendido",
	deceased: "Fallecido",
	archived: "Archivado",
} as const;

interface IndividualListProps {
	individuals: ILivestockIndividual[];
	availableParents?: ILivestockIndividual[];
	totalIndividuals?: number;
	searchQuery: string;
	onSearchQueryChange: (value: string) => void;
	isLoading?: boolean;
	onSelectIndividual?: (individual: ILivestockIndividual) => void;
	onUpdateIndividual?: (
		individual: ILivestockIndividual,
		data: IndividualFormData,
	) => Promise<void>;
	onDeleteIndividual?: (individual: ILivestockIndividual) => Promise<void>;
	onCreateIndividual?: () => void;
	isUpdatingIndividual?: boolean;
}

function getIndividualTag(individual: ILivestockIndividual): string {
	return individual.tag?.trim() || `#${individual.id}`;
}

function getIndividualName(individual: ILivestockIndividual): string | null {
	const name = individual.name?.trim();
	return name || null;
}

function formatIndividualLabel(individual: ILivestockIndividual): string {
	const tag = getIndividualTag(individual);
	const name = getIndividualName(individual);
	return name ? `${tag} (${name})` : tag;
}

export function IndividualList({
	individuals,
	availableParents = [],
	totalIndividuals,
	searchQuery,
	onSearchQueryChange,
	isLoading = false,
	onSelectIndividual,
	onUpdateIndividual,
	onDeleteIndividual,
	onCreateIndividual,
	isUpdatingIndividual = false,
}: IndividualListProps) {
	const [editingIndividualId, setEditingIndividualId] = useState<number | null>(
		null,
	);
	const [deletingId, setDeletingId] = useState<number | null>(null);
	const [pendingDeleteIndividual, setPendingDeleteIndividual] =
		useState<ILivestockIndividual | null>(null);
	const headerTotal = totalIndividuals ?? individuals.length;

	const handleUpdate = async (
		individual: ILivestockIndividual,
		data: IndividualFormData,
	) => {
		await onUpdateIndividual?.(individual, data);
		setEditingIndividualId(null);
	};

	const handleDelete = async (individual: ILivestockIndividual) => {
		try {
			setEditingIndividualId(null);
			setDeletingId(individual.id);
			await onDeleteIndividual?.(individual);
			setPendingDeleteIndividual(null);
		} finally {
			setDeletingId(null);
		}
	};

	return (
		<div className="space-y-4">
			{/* Header */}
			<div className="flex items-center justify-between gap-2">
				<h2 className="text-lg font-bold">Individuos ({headerTotal})</h2>
				{onCreateIndividual && (
					<button
						onClick={onCreateIndividual}
						className="rounded-lg bg-blue-600 px-3 py-1 text-sm font-medium text-white hover:bg-blue-700"
					>
						+ Agregar individuo
					</button>
				)}
			</div>

			{/* Search */}
			<div className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2">
				<span className="text-gray-400">🔍</span>
				<input
					type="search"
					placeholder="Buscar por nombre o identificador..."
					value={searchQuery}
					onChange={(event) => onSearchQueryChange(event.target.value)}
					className="flex-1 bg-transparent outline-none"
				/>
			</div>

			{/* List */}
			{isLoading ? (
				<div className="py-8 text-center text-gray-500">Cargando...</div>
			) : individuals.length === 0 ? (
				<div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 py-8 text-center text-gray-500">
					{searchQuery.trim()
						? "No hay individuos que coincidan con tu busqueda"
						: "Aun no hay individuos"}
				</div>
			) : (
				<div className="divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white">
					{individuals.map((individual) => {
						const isEditing = editingIndividualId === individual.id;
						const isConfirmingDelete =
							pendingDeleteIndividual?.id === individual.id;
						const isDeleting = deletingId === individual.id;
						const tag = getIndividualTag(individual);
						const name = getIndividualName(individual);
						const sex =
							(individual.extra?.sex as keyof typeof SEX_SYMBOL | undefined) ??
							"unknown";

						if (isEditing) {
							return (
								<div
									key={individual.id}
									className="space-y-4 bg-blue-50/50 p-4"
								>
									<div className="flex items-center justify-between gap-3">
										<div>
											<p className="font-semibold">Editar individuo</p>
											<p className="text-sm text-gray-600">
												{formatIndividualLabel(individual)}
											</p>
										</div>
										<div
											className={`rounded-full px-2 py-1 text-xs font-semibold ${
												STATUS_COLORS[
													individual.status as keyof typeof STATUS_COLORS
												]
											}`}
										>
											{STATUS_LABELS[
												individual.status as keyof typeof STATUS_LABELS
											] ?? individual.status}
										</div>
									</div>
									<IndividualForm
										individual={individual}
										availableParents={availableParents}
										onSubmit={(data) => handleUpdate(individual, data)}
										onCancel={() => setEditingIndividualId(null)}
										isLoading={isUpdatingIndividual}
									/>
								</div>
							);
						}

						return (
							<div
								key={individual.id}
								className="p-4"
							>
								<div className="flex items-center justify-between gap-4 hover:bg-gray-50">
									<button
										type="button"
										onClick={() => onSelectIndividual?.(individual)}
										className="flex-1 text-left"
									>
										<div className="flex items-center gap-3">
											<div>
												<p className="font-semibold">{tag}</p>
												<p className="text-sm text-gray-600">
													{name
														? `${name} · ${SEX_SYMBOL[sex]}`
														: SEX_SYMBOL[sex]}
												</p>
											</div>
										</div>
									</button>

									<div
										className={`rounded-full px-2 py-1 text-xs font-semibold ${
											STATUS_COLORS[
												individual.status as keyof typeof STATUS_COLORS
											]
										}`}
									>
										{STATUS_LABELS[
											individual.status as keyof typeof STATUS_LABELS
										] ?? individual.status}
									</div>

									<div className="flex gap-1">
										{onUpdateIndividual && (
											<button
												type="button"
												onClick={() => {
													setPendingDeleteIndividual(null);
													setEditingIndividualId(individual.id);
												}}
												className="rounded px-2 py-1 text-xs hover:bg-gray-200"
											>
												Editar
											</button>
										)}
										{onDeleteIndividual && (
											<button
												type="button"
												onClick={() => {
													setEditingIndividualId(null);
													setPendingDeleteIndividual(individual);
												}}
												disabled={isDeleting}
												className="rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50 disabled:opacity-50"
											>
												{isDeleting ? "..." : "Eliminar"}
											</button>
										)}
									</div>
								</div>

								{isConfirmingDelete ? (
									<div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-red-200 bg-red-50/70 px-3 py-2">
										<p className="text-sm font-medium text-red-700">
											Eliminar {formatIndividualLabel(individual)}?
										</p>
										<div className="flex items-center gap-2">
											<button
												type="button"
												onClick={() => setPendingDeleteIndividual(null)}
												disabled={isDeleting}
												className="rounded-full border border-gray-300 px-3 py-1 text-xs font-semibold disabled:opacity-60"
											>
												Cancelar
											</button>
											<button
												type="button"
												onClick={() => void handleDelete(individual)}
												disabled={isDeleting}
												className="rounded-full border border-red-200 bg-red-100 px-3 py-1 text-xs font-semibold text-red-700 disabled:opacity-60"
											>
												{isDeleting ? "Eliminando..." : "Confirmar eliminar"}
											</button>
										</div>
									</div>
								) : null}
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}
