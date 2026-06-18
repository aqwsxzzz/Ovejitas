import { useState } from "react";
import { MapPin } from "lucide-react";

import { useNavigate } from "@tanstack/react-router";

import { AssetKindMedal } from "@/features/livestock/components/asset-kind-medal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { LivestockAssetKind } from "@/features/livestock/types/livestock-types";

interface LivestockUnitRowProps {
	id: number;
	name: string;
	kind: LivestockAssetKind;
	location: string | null;
	description: string | null;
	mode: "aggregated" | "individual" | null;
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
					<Input
						type="text"
						value={props.editName}
						onChange={(event) => props.onChangeName(event.target.value)}
						placeholder="Nombre del lote"
					/>
					<Input
						type="text"
						value={props.editLocation}
						onChange={(event) => props.onChangeLocation(event.target.value)}
						placeholder="Ubicacion"
					/>
				</div>
				<Textarea
					value={props.editDescription}
					onChange={(event) => props.onChangeDescription(event.target.value)}
					placeholder="Descripcion"
					rows={3}
				/>
				<div className="flex items-center gap-2">
					<Button
						type="button"
						variant="default"
						size="sm"
						onClick={() => void props.onSaveEdit()}
						disabled={props.isSaving}
					>
						{props.isSaving ? "Guardando..." : "Guardar"}
					</Button>
					<Button
						type="button"
						variant="outline"
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

		if (props.kind === "location") {
			navigate({
				to: "/v2/location/$locationId",
				params: { locationId: String(props.id) },
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
							{props.mode ? (
								<span
									className={`rounded-full px-2 py-0.5 text-xs font-medium ${
										props.mode === "individual"
											? "bg-info/10 text-info"
											: "bg-(--v2-surface) text-(--v2-ink-soft)"
									}`}
								>
									{props.mode === "individual" ? "Individual" : "Agrupado"}
								</span>
							) : null}
							{props.location ? (
								<span className="flex items-center gap-1 text-sm text-[color:var(--v2-ink-soft)]">
									<MapPin className="h-4 w-4 flex-shrink-0" />
									{props.location}
								</span>
							) : null}
						</div>
						{props.description ? (
							<p className="mt-1 line-clamp-2 text-sm text-[color:var(--v2-ink-soft)]">
								{props.description}
							</p>
						) : null}
					</div>
				</div>
				{isConfirmingDelete ? null : (
					<div className="flex items-center gap-2">
						<Button
							type="button"
							variant="outline"
							size="icon"
							onClick={(event) => {
								event.stopPropagation();
								setIsConfirmingDelete(false);
								props.onStartEdit();
							}}
							aria-label="Editar"
							title="Editar"
							className="size-9 rounded-full"
						>
							<span aria-hidden="true">✎</span>
						</Button>
						<Button
							type="button"
							variant="outline"
							size="icon"
							onClick={(event) => {
								event.stopPropagation();
								setIsConfirmingDelete(true);
							}}
							disabled={props.isDeleting}
							aria-label="Eliminar"
							title="Eliminar"
							className="size-9 rounded-full text-destructive hover:text-destructive"
						>
							<span aria-hidden="true">{props.isDeleting ? "⏳" : "🗑"}</span>
						</Button>
					</div>
				)}
			</div>

			{isConfirmingDelete ? (
				<div
					className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2"
					onClick={(event) => event.stopPropagation()}
				>
					<p className="text-sm font-medium text-destructive">Eliminar este lote?</p>
					<div className="flex items-center gap-2">
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={() => setIsConfirmingDelete(false)}
							disabled={props.isDeleting}
						>
							Cancelar
						</Button>
						<Button
							type="button"
							variant="destructive"
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
