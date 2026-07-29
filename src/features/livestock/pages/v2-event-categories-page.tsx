import { useMemo, useState } from "react";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { LoadingState } from "@/components/common/loading-state";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGetUserProfile } from "@/features/auth/api/auth-queries";
import {
	deleteEventCategoryById,
	updateEventCategoryById,
} from "@/features/livestock/api/livestock-api";
import { useListEventCategoriesByFarmId } from "@/features/livestock/api/livestock-queries";
import { ApiRequestError } from "@/lib/axios/axios-helper";
import {
	EVENT_TYPE_LABELS,
	type ILivestockEventCategory,
	type LivestockEventType,
} from "@/features/livestock/types/livestock-types";

function getDeleteCategoryErrorMessage(error: unknown): string {
	const detail =
		error instanceof ApiRequestError ? error.message.toLowerCase() : "";
	if (detail.includes("recorded stock")) {
		return "No se puede eliminar: este producto ya tiene stock registrado. Archivalo en su lugar.";
	}
	// The backend raises an unhandled FK violation when a production target still
	// points at the category, so there is no message to key off — only a 500.
	return "No se pudo eliminar la categoria. Puede tener stock o una meta de produccion asociada.";
}

export function V2EventCategoriesPage() {
	const { data: currentUser } = useGetUserProfile();
	const farmId = currentUser?.lastVisitedFarmId ?? "";
	const [editingCategoryId, setEditingCategoryId] = useState<number | null>(
		null,
	);
	const [nameDraft, setNameDraft] = useState("");
	const [colorDraft, setColorDraft] = useState("#8a8677");
	const [savingId, setSavingId] = useState<number | null>(null);
	const [deletingId, setDeletingId] = useState<number | null>(null);
	const [pendingDelete, setPendingDelete] =
		useState<ILivestockEventCategory | null>(null);
	const [message, setMessage] = useState("");

	const {
		data: categories = [],
		isLoading,
		refetch,
	} = useListEventCategoriesByFarmId({
		farmId,
		filters: { archived: false, sort: "type,name", pageSize: 100 },
		enabled: !!farmId,
	});

	const groupedCategories = useMemo(() => {
		const grouped = new Map<LivestockEventType, ILivestockEventCategory[]>();
		for (const category of categories) {
			const list = grouped.get(category.type) ?? [];
			list.push(category);
			grouped.set(category.type, list);
		}

		return Array.from(grouped.entries()).sort(([left], [right]) =>
			left.localeCompare(right),
		);
	}, [categories]);

	const startEdit = (category: ILivestockEventCategory) => {
		setEditingCategoryId(category.id);
		setNameDraft(category.name);
		setColorDraft(category.color ?? "#8a8677");
		setMessage("");
	};

	const cancelEdit = () => {
		setEditingCategoryId(null);
		setNameDraft("");
		setColorDraft("#8a8677");
	};

	const saveEdit = async (category: ILivestockEventCategory) => {
		if (!farmId || !nameDraft.trim()) return;

		setSavingId(category.id);
		setMessage("");
		try {
			await updateEventCategoryById({
				farmId,
				categoryId: category.id,
				data: {
					name: nameDraft.trim(),
					color: colorDraft,
				},
			});
			setMessage("Categoria actualizada.");
			cancelEdit();
			await refetch();
		} finally {
			setSavingId(null);
		}
	};

	const archiveCategory = async (category: ILivestockEventCategory) => {
		if (!farmId) return;
		setDeletingId(category.id);
		setMessage("");
		try {
			await updateEventCategoryById({
				farmId,
				categoryId: category.id,
				data: { archived_at: new Date().toISOString() },
			});
			setMessage("Categoria archivada.");
			await refetch();
		} catch (caught) {
			setMessage(getDeleteCategoryErrorMessage(caught));
		} finally {
			setDeletingId(null);
			setPendingDelete(null);
		}
	};

	const deleteCategory = async (category: ILivestockEventCategory) => {
		if (!farmId) return;
		setDeletingId(category.id);
		setMessage("");
		try {
			await deleteEventCategoryById({
				farmId,
				categoryId: category.id,
			});
			if (editingCategoryId === category.id) {
				cancelEdit();
			}
			setMessage("Categoria eliminada.");
			await refetch();
		} catch (caught) {
			// A production category can be undeletable for reasons the farmer can
			// act on — its pool holds stock, or a meta still points at it. Without
			// this the request just failed silently and the row stayed put with no
			// explanation.
			setMessage(getDeleteCategoryErrorMessage(caught));
		} finally {
			setDeletingId(null);
			setPendingDelete(null);
		}
	};

	if (!farmId) {
		return (
			<section className="space-y-4">
				<div className="v2-card p-5 md:p-6">
					<p className="v2-kicker">Categorias de eventos</p>
					<h2 className="mt-2 text-xl font-semibold">Sin granja activa</h2>
					<p className="mt-1 text-sm text-(--v2-ink-soft)">
						Selecciona una granja para gestionar categorias.
					</p>
				</div>
			</section>
		);
	}

	return (
		<section className="space-y-4">
			<div className="v2-card p-5 md:p-6">
				<p className="v2-kicker">Categorias de eventos</p>
				<h2 className="mt-2 text-xl font-semibold">Gestionar categorias</h2>
				<p className="mt-1 text-sm text-(--v2-ink-soft)">
					Edita nombre/color, archiva las que ya no uses, o eliminalas si nunca
					registraron nada.
				</p>
			</div>

			<ConfirmDialog
				open={pendingDelete !== null}
				onOpenChange={(next) => {
					if (!next) setPendingDelete(null);
				}}
				title="Eliminar categoria"
				description={
					<>
						Se eliminara <strong>{pendingDelete?.name}</strong> de forma
						permanente. Si ya registro produccion o stock no se podra eliminar —
						archivala en su lugar.
					</>
				}
				isPending={pendingDelete !== null && deletingId === pendingDelete.id}
				onConfirm={() => {
					if (pendingDelete) void deleteCategory(pendingDelete);
				}}
			/>

			{isLoading ? (
				<div className="v2-card p-4">
					<LoadingState message="Cargando categorias..." />
				</div>
			) : groupedCategories.length === 0 ? (
				<div className="v2-card p-4">
					<p className="text-sm text-(--v2-ink-soft)">
						No hay categorias creadas todavia.
					</p>
				</div>
			) : (
				<div className="space-y-3">
					{groupedCategories.map(([type, typeCategories]) => (
						<div
							key={type}
							className="v2-card p-4"
						>
							<p className="v2-kicker">{EVENT_TYPE_LABELS[type]}</p>
							<div className="mt-3 space-y-2">
								{typeCategories.map((category) => {
									const isEditing = editingCategoryId === category.id;
									const isSaving = savingId === category.id;
									const isDeleting = deletingId === category.id;

									return (
										<div
											key={category.id}
											className="rounded-lg border border-(--v2-border) bg-(--v2-surface) p-3"
										>
											{isEditing ? (
												<div className="space-y-2">
													<Input
														value={nameDraft}
														onChange={(event) =>
															setNameDraft(event.target.value)
														}
														placeholder="Nombre"
													/>
													<div className="flex items-center gap-2">
														<Input
															type="color"
															value={colorDraft}
															onChange={(event) =>
																setColorDraft(event.target.value)
															}
															className="w-20 px-1 py-1"
														/>
														<div className="ml-auto flex gap-2">
															<Button
																type="button"
																variant="outline"
																size="sm"
																onClick={cancelEdit}
															>
																Cancelar
															</Button>
															<Button
																type="button"
																variant="default"
																size="sm"
																onClick={() => void saveEdit(category)}
																disabled={isSaving || !nameDraft.trim()}
															>
																{isSaving ? "Guardando..." : "Guardar"}
															</Button>
														</div>
													</div>
												</div>
											) : (
												<div className="flex items-center gap-2">
													<span
														className="h-3 w-3 rounded-full border border-(--v2-border)"
														style={{
															backgroundColor: category.color ?? "#8a8677",
														}}
													/>
													<p className="text-sm font-medium">{category.name}</p>
													<div className="ml-auto flex gap-2">
														<Button
															type="button"
															variant="outline"
															size="sm"
															onClick={() => startEdit(category)}
														>
															Editar
														</Button>
														<Button
															type="button"
															variant="outline"
															size="sm"
															onClick={() => void archiveCategory(category)}
															disabled={isDeleting}
														>
															Archivar
														</Button>
														<Button
															type="button"
															variant="ghost"
															size="sm"
															onClick={() => setPendingDelete(category)}
															disabled={isDeleting}
															className="text-destructive hover:bg-destructive/10 hover:text-destructive"
														>
															{isDeleting ? "Eliminando..." : "Eliminar"}
														</Button>
													</div>
												</div>
											)}
										</div>
									);
								})}
							</div>
						</div>
					))}
				</div>
			)}

			{message ? <p className="text-sm text-success">{message}</p> : null}
		</section>
	);
}
