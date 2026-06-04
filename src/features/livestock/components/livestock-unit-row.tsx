import { useState } from "react";
import { MapPin } from "lucide-react";

import { useNavigate } from "@tanstack/react-router";

import { AssetKindMedal } from "@/features/livestock/components/asset-kind-medal";
import { Button } from "@/components/ui/button";
import type { LivestockAssetKind } from "@/features/livestock/types/livestock-types";

interface LivestockUnitRowProps {
	id: number;
	name: string;
	kind: LivestockAssetKind;
	location: string | null;
	description: string | null;
	mode: "aggregated" | "individual";
	isEditing: boolean;
	editName: string;
	editLocation: string;
	editDescription: string;
	onStartEdit: () => void;
	onCancelEdit: () => void;
	onChangeName: (value: string) => void;
	onChangeLocation: (value: string) => void;
	onChangeDescription: (value: string) => void;
	onSaveEdit: () => Promise<void>;
	onDelete: () => Promise<void>;
	isDeleting: boolean;
	isSaving: boolean;
}

export function LivestockUnitRow(props: LivestockUnitRowProps) {
	const navigate = useNavigate();
	const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

	if (props.isEditing) {
		return (
			<div className="v2-card space-y-3 p-4">
				<div className="grid gap-2 md:grid-cols-2">
					<input
						type="text"
						value={props.editName}
						onChange={(event) => props.onChangeName(event.target.value)}
						placeholder="Nombre del lote"
						className="rounded-lg border border-[color:var(--v2-border)] px-3 py-2 text-sm"
					/>
					<input
						type="text"
						value={props.editLocation}
						onChange={(event) => props.onChangeLocation(event.target.value)}
						placeholder="Ubicacion"
						className="rounded-lg border border-[color:var(--v2-border)] px-3 py-2 text-sm"
					/>
				</div>
				<textarea
					value={props.editDescription}
					onChange={(event) => props.onChangeDescription(event.target.value)}
					placeholder="Descripcion"
					rows={3}
					className="w-full rounded-lg border border-[color:var(--v2-border)] px-3 py-2 text-sm"
				/>
				<div className="flex items-center gap-2">
					<Button
						type="button"
						variant="create"
						size="sm"
						onClick={() => void props.onSaveEdit()}
						disabled={props.isSaving}
					>
						{props.isSaving ? "Guardando..." : "Guardar"}
					</Button>
					<Button
						type="button"
						variant="neutral"
						size="sm"
						onClick={props.onCancelEdit}
						disabled={props.isSaving}
					>
						Cancelar
					</Button>
				</div>
			</div>
		);
	}

	const openDetail = () => {
		if (isConfirmingDelete) return;

		if (props.kind === "crop") {
			navigate({ to: "/v2/crops/$cropId", params: { cropId: String(props.id) } });
			return;
		}

		if (props.kind === "equipment") {
			navigate({
				to: "/v2/equipment/$equipmentId",
				params: { equipmentId: String(props.id) },
			});
			return;
		}

		navigate({
			to: "/v2/production-units/flock/$unitId",
			params: { unitId: String(props.id) },
			search: { eventType: props.kind === "material" ? "inventory" : undefined },
		});
	};

	return (
		<div
			role={isConfirmingDelete ? undefined : "link"}
			tabIndex={isConfirmingDelete ? -1 : 0}
			onClick={openDetail}
			onKeyDown={(event) => {
				if (isConfirmingDelete) return;
				if (event.key === "Enter" || event.key === " ") {
					event.preventDefault();
					openDetail();
				}
			}}
			className="v2-card block cursor-pointer p-4 transition hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--v2-ink) focus-visible:ring-offset-2"
		>
			<div className="flex items-center justify-between gap-3">
				<div className="flex min-w-0 items-start gap-3">
					<AssetKindMedal kind={props.kind} />
					<div className="min-w-0">
						<div className="flex flex-wrap items-center gap-2">
							<p className="font-semibold leading-tight">{props.name}</p>
							<span
								className={`rounded-full px-2 py-0.5 text-xs font-medium ${
									props.mode === "individual"
										? "bg-blue-50 text-blue-700"
										: "bg-(--v2-surface) text-(--v2-ink-soft)"
								}`}
							>
								{props.mode === "individual" ? "Individual" : "Agrupado"}
							</span>
						</div>
						<div className="mt-1 flex items-center gap-1">
							<MapPin className="h-4 w-4 flex-shrink-0 text-[color:var(--v2-ink-soft)]" />
							<p className="text-sm text-[color:var(--v2-ink-soft)]">
								{props.location ?? "Sin ubicacion"}
							</p>
						</div>
					</div>
				</div>
				{isConfirmingDelete ? null : (
					<div className="flex items-center gap-2">
						<button
							type="button"
							onClick={(event) => {
								event.stopPropagation();
								setIsConfirmingDelete(false);
								props.onStartEdit();
							}}
							aria-label="Editar"
							title="Editar"
							className="rounded-full border border-(--v2-border) px-2.5 py-1 text-sm font-semibold"
						>
							<span aria-hidden="true">✎</span>
						</button>
						<button
							type="button"
							onClick={(event) => {
								event.stopPropagation();
								setIsConfirmingDelete(true);
							}}
							disabled={props.isDeleting}
							aria-label="Eliminar"
							title="Eliminar"
							className="rounded-full border border-red-200 px-2.5 py-1 text-sm font-semibold text-red-700 disabled:opacity-60"
						>
							<span aria-hidden="true">{props.isDeleting ? "⏳" : "🗑"}</span>
						</button>
					</div>
				)}
			</div>

			{isConfirmingDelete ? (
				<div
					className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-red-200 bg-red-50/70 px-3 py-2"
					onClick={(event) => event.stopPropagation()}
				>
					<p className="text-sm font-medium text-red-700">Eliminar este lote?</p>
					<div className="flex items-center gap-2">
						<Button
							type="button"
							variant="neutral"
							size="sm"
							onClick={() => setIsConfirmingDelete(false)}
							disabled={props.isDeleting}
						>
							Cancelar
						</Button>
						<Button
							type="button"
							variant="destroy"
							size="sm"
							onClick={() => void props.onDelete()}
							disabled={props.isDeleting}
						>
							{props.isDeleting ? "Eliminando..." : "Confirmar eliminar"}
						</Button>
					</div>
				</div>
			) : null}
		</div>
	);
}
