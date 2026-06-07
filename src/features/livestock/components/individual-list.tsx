import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IndividualForm } from "@/features/livestock/components/individual-form";
import type { IndividualFormData } from "@/features/livestock/components/individual-form";
import type { ILivestockIndividual } from "@/features/livestock/types/livestock-types";

const STATUS_COLORS = {
	active: "text-success bg-success/10",
	sold: "text-warning bg-warning/10",
	deceased: "text-destructive bg-destructive/10",
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
					<Button
						variant="default"
						size="sm"
						onClick={onCreateIndividual}
					>
						+ Agregar individuo
					</Button>
				)}
			</div>

			{/* Search */}
			<div className="flex items-center gap-2 rounded-lg border border-input bg-white px-3 py-2">
				<span className="text-muted-foreground">🔍</span>
				<Input
					type="search"
					placeholder="Buscar por nombre o identificador..."
					value={searchQuery}
					onChange={(event) => onSearchQueryChange(event.target.value)}
					className="h-auto flex-1 border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
				/>
			</div>

			{/* List */}
			{isLoading ? (
				<div className="py-8 text-center text-muted-foreground">Cargando...</div>
			) : individuals.length === 0 ? (
				<div className="rounded-lg border border-dashed border-input bg-muted py-8 text-center text-muted-foreground">
					{searchQuery.trim()
						? "No hay individuos que coincidan con tu busqueda"
						: "Aun no hay individuos"}
				</div>
			) : (
				<div className="divide-y divide-border rounded-lg border border-border bg-white">
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
									className="space-y-4 bg-info/10 p-4"
								>
									<div className="flex items-center justify-between gap-3">
										<div>
											<p className="font-semibold">Editar individuo</p>
											<p className="text-sm text-muted-foreground">
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
								<div className="flex items-center justify-between gap-4 hover:bg-muted">
									<Button
										type="button"
										variant="ghost"
										onClick={() => onSelectIndividual?.(individual)}
										className="h-auto flex-1 justify-start p-0 text-left hover:bg-transparent"
									>
										<div className="flex items-center gap-3">
											<div>
												<p className="font-semibold">{tag}</p>
												<p className="text-sm text-muted-foreground">
													{name
														? `${name} · ${SEX_SYMBOL[sex]}`
														: SEX_SYMBOL[sex]}
												</p>
											</div>
										</div>
									</Button>

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
											<Button
												type="button"
												variant="ghost"
												size="sm"
												onClick={() => {
													setPendingDeleteIndividual(null);
													setEditingIndividualId(individual.id);
												}}
											>
												Editar
											</Button>
										)}
										{onDeleteIndividual && (
											<Button
												type="button"
												variant="ghost"
												size="sm"
												onClick={() => {
													setEditingIndividualId(null);
													setPendingDeleteIndividual(individual);
												}}
												disabled={isDeleting}
												className="text-destructive hover:bg-destructive/10 hover:text-destructive"
											>
												{isDeleting ? "..." : "Eliminar"}
											</Button>
										)}
									</div>
								</div>

								{isConfirmingDelete ? (
									<div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2">
										<p className="text-sm font-medium text-destructive">
											Eliminar {formatIndividualLabel(individual)}?
										</p>
										<div className="flex items-center gap-2">
											<Button
												type="button"
												variant="outline"
												size="sm"
												onClick={() => setPendingDeleteIndividual(null)}
												disabled={isDeleting}
											>
												Cancelar
											</Button>
											<Button
												type="button"
												variant="destructive"
												size="sm"
												onClick={() => void handleDelete(individual)}
												disabled={isDeleting}
											>
												{isDeleting ? "Eliminando..." : "Confirmar eliminar"}
											</Button>
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
