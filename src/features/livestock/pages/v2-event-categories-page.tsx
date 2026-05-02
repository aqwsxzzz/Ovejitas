import { useMemo, useState } from "react";

import { useGetUserProfile } from "@/features/auth/api/auth-queries";
import {
	deleteEventCategoryById,
	updateEventCategoryById,
} from "@/features/livestock/api/livestock-api";
import { useListEventCategoriesByFarmId } from "@/features/livestock/api/livestock-queries";
import type {
	ILivestockEventCategory,
	LivestockEventType,
} from "@/features/livestock/types/livestock-types";

function eventTypeLabelEs(type: LivestockEventType): string {
	switch (type) {
		case "production":
			return "Produccion";
		case "expense":
			return "Gasto";
		case "income":
			return "Ingreso";
		case "observation":
			return "Observacion";
		case "reproductive":
			return "Reproductivo";
		case "acquisition":
			return "Adquisicion";
		case "mortality":
			return "Mortalidad";
		default:
			return type;
	}
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

	const deleteCategory = async (category: ILivestockEventCategory) => {
		if (!farmId) return;
		if (!confirm(`Eliminar categoria "${category.name}"?`)) return;

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
		} finally {
			setDeletingId(null);
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
					Edita nombre/color y elimina categorias que ya no uses.
				</p>
			</div>

			{isLoading ? (
				<div className="v2-card p-4">
					<p className="text-sm text-(--v2-ink-soft)">Cargando categorias...</p>
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
							<p className="v2-kicker">{eventTypeLabelEs(type)}</p>
							<div className="mt-3 space-y-2">
								{typeCategories.map((category) => {
									const isEditing = editingCategoryId === category.id;
									const isSaving = savingId === category.id;
									const isDeleting = deletingId === category.id;

									return (
										<div
											key={category.id}
											className="rounded-lg border border-(--v2-border) bg-white p-3"
										>
											{isEditing ? (
												<div className="space-y-2">
													<input
														value={nameDraft}
														onChange={(event) =>
															setNameDraft(event.target.value)
														}
														className="w-full rounded-lg border border-(--v2-border) px-3 py-2 text-sm"
														placeholder="Nombre"
													/>
													<div className="flex items-center gap-2">
														<input
															type="color"
															value={colorDraft}
															onChange={(event) =>
																setColorDraft(event.target.value)
															}
															className="h-9 w-20 rounded-lg border border-(--v2-border)"
														/>
														<div className="ml-auto flex gap-2">
															<button
																type="button"
																onClick={cancelEdit}
																className="rounded-full border border-(--v2-border) px-3 py-1 text-xs font-semibold"
															>
																Cancelar
															</button>
															<button
																type="button"
																onClick={() => void saveEdit(category)}
																disabled={isSaving || !nameDraft.trim()}
																className="rounded-full bg-(--v2-ink) px-3 py-1 text-xs font-semibold text-white disabled:opacity-60"
															>
																{isSaving ? "Guardando..." : "Guardar"}
															</button>
														</div>
													</div>
												</div>
											) : (
												<div className="flex items-center gap-2">
													<span
														className="h-3 w-3 rounded-full border border-black/10"
														style={{
															backgroundColor: category.color ?? "#8a8677",
														}}
													/>
													<p className="text-sm font-medium">{category.name}</p>
													<div className="ml-auto flex gap-2">
														<button
															type="button"
															onClick={() => startEdit(category)}
															className="rounded-full border border-(--v2-border) px-3 py-1 text-xs font-semibold"
														>
															Editar
														</button>
														<button
															type="button"
															onClick={() => void deleteCategory(category)}
															disabled={isDeleting}
															className="rounded-full border border-rose-300 px-3 py-1 text-xs font-semibold text-rose-700 disabled:opacity-60"
														>
															{isDeleting ? "Eliminando..." : "Eliminar"}
														</button>
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

			{message ? <p className="text-sm text-emerald-700">{message}</p> : null}
		</section>
	);
}
