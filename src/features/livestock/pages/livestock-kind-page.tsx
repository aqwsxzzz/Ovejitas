import { useState } from "react";
import { MapPin } from "lucide-react";

import { Link, useLocation, useNavigate } from "@tanstack/react-router";

import { useGetUserProfile } from "@/features/auth/api/auth-queries";
import { ASSET_KIND_OPTIONS } from "@/features/livestock/constants/asset-kind-options";
import { AssetKindMedal } from "@/features/livestock/components/asset-kind-medal";
import { CreateMaterialAssetDialog } from "@/features/livestock/components/create-material-asset-dialog";
import { Button } from "@/components/ui/button";
import {
	useDeleteLivestockAssetById,
	useListLivestockAssetsByFarmId,
	useUpdateLivestockAssetById,
} from "@/features/livestock/api/livestock-queries";
import type { LivestockAssetKind } from "@/features/livestock/types/livestock-types";

interface SearchBarProps {
	value: string;
	onChange: (value: string) => void;
	placeholder: string;
	ariaLabel: string;
}

function SearchBar({
	value,
	onChange,
	placeholder,
	ariaLabel,
}: SearchBarProps) {
	return (
		<div className="flex items-center gap-2 rounded-xl border border-dashed border-[color:var(--v2-border)] bg-white px-3 py-2.5">
			<span
				className="text-base"
				aria-hidden="true"
			>
				🔍
			</span>
			<input
				type="search"
				value={value}
				onChange={(event) => onChange(event.target.value)}
				placeholder={placeholder}
				className="flex-1 bg-transparent text-sm outline-none placeholder:text-[color:var(--v2-ink-soft)]"
				aria-label={ariaLabel}
			/>
		</div>
	);
}

function LivestockUnitRow(props: {
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
}) {
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

		navigate({
			to: "/v2/production-units/flock/$unitId",
			params: { unitId: String(props.id) },
			search: {
				eventType: props.kind === "material" ? "inventory" : undefined,
			},
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
					<p className="text-sm font-medium text-red-700">
						Eliminar este lote?
					</p>
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

export function LivestockKindPage({
	selectedKind,
}: {
	selectedKind: LivestockAssetKind;
}) {
	const location = useLocation();
	const [query, setQuery] = useState("");
	const [editingAssetId, setEditingAssetId] = useState<number | null>(null);
	const [editName, setEditName] = useState("");
	const [editLocation, setEditLocation] = useState("");
	const [editDescription, setEditDescription] = useState("");
	const [deletingAssetId, setDeletingAssetId] = useState<number | null>(null);
	const { data: currentUser } = useGetUserProfile();
	const farmId = currentUser?.lastVisitedFarmId ?? "";

	const { data: farmAssetsResponse, isLoading } =
		useListLivestockAssetsByFarmId({
			farmId,
			filters: {
				q: query.trim() || undefined,
				sort: "-updated_at",
				kind: selectedKind,
				page: 1,
				pageSize: 20,
			},
			enabled: !!farmId,
		});

	const updateAssetMutation = useUpdateLivestockAssetById();
	const deleteAssetMutation = useDeleteLivestockAssetById();
	const sourcePath =
		typeof window === "undefined"
			? location.pathname
			: `${location.pathname}${window.location.search}`;
	const activeKindMeta =
		ASSET_KIND_OPTIONS.find((option) => option.kind === selectedKind) ??
		ASSET_KIND_OPTIONS[0]!;
	const units = farmAssetsResponse?.data ?? [];

	const handleStartEdit = (
		id: number,
		name: string,
		location: string | null,
		description: string | null,
	) => {
		setEditingAssetId(id);
		setEditName(name);
		setEditLocation(location ?? "");
		setEditDescription(description ?? "");
	};

	const handleSaveEdit = async () => {
		if (!farmId || editingAssetId == null || !editName.trim()) return;

		await updateAssetMutation.mutateAsync({
			farmId,
			assetId: editingAssetId,
			data: {
				name: editName.trim(),
				location: editLocation.trim() || null,
				description: editDescription.trim() || null,
			},
		});

		setEditingAssetId(null);
	};

	const handleDeleteAsset = async (assetId: number) => {
		if (!farmId) return;

		setDeletingAssetId(assetId);
		try {
			await deleteAssetMutation.mutateAsync({ farmId, assetId });
			if (editingAssetId === assetId) {
				setEditingAssetId(null);
			}
		} finally {
			setDeletingAssetId(null);
		}
	};

	if (!farmId) {
		return (
			<section className="space-y-4">
				<div className="v2-card p-5">
					<h1 className="text-2xl font-semibold">Activos</h1>
					<p className="mt-1 text-sm text-[color:var(--v2-ink-soft)]">
						Selecciona una granja para cargar datos reales.
					</p>
				</div>
			</section>
		);
	}

	return (
		<section className="space-y-4">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-semibold">Activos</h1>
					<p className="text-sm text-[color:var(--v2-ink-soft)]">
						{farmAssetsResponse?.meta.total ?? units.length}{" "}
						{activeKindMeta.pluralLabel}
					</p>
				</div>
				{selectedKind === "animal" ? (
					<Button
						asChild
						variant="create"
						size="sm"
					>
						<Link
							to="/v2/log"
							search={{
								actionId: "nuevo-lote",
								actionLabel: "Nuevo lote",
								contextLabel: activeKindMeta.title,
								sourcePath,
							}}
						>
							Nuevo lote
						</Link>
					</Button>
				) : selectedKind === "material" ? (
					<CreateMaterialAssetDialog farmId={farmId} />
				) : null}
			</div>

			<SearchBar
				value={query}
				onChange={setQuery}
				placeholder={`Buscar ${activeKindMeta.title.toLowerCase()} por nombre o ubicacion...`}
				ariaLabel={`Buscar ${activeKindMeta.title.toLowerCase()} por nombre o ubicacion`}
			/>

			{isLoading ? (
				<p className="text-sm text-[color:var(--v2-ink-soft)]">
					Cargando {activeKindMeta.title.toLowerCase()}...
				</p>
			) : units.length === 0 ? (
				<p className="text-sm text-[color:var(--v2-ink-soft)]">
					No hay {activeKindMeta.title.toLowerCase()} reales que coincidan con "
					{query}".
				</p>
			) : (
				<div className="space-y-2">
					{units.map((unit) => (
						<LivestockUnitRow
							key={unit.id}
							id={unit.id}
							name={unit.name}
							kind={unit.kind}
							location={unit.location}
							description={unit.description}
							mode={unit.mode}
							isEditing={editingAssetId === unit.id}
							editName={editName}
							editLocation={editLocation}
							editDescription={editDescription}
							onStartEdit={() =>
								handleStartEdit(
									unit.id,
									unit.name,
									unit.location,
									unit.description,
								)
							}
							onCancelEdit={() => setEditingAssetId(null)}
							onChangeName={setEditName}
							onChangeLocation={setEditLocation}
							onChangeDescription={setEditDescription}
							onSaveEdit={handleSaveEdit}
							onDelete={() => handleDeleteAsset(unit.id)}
							isDeleting={deletingAssetId === unit.id}
							isSaving={
								updateAssetMutation.isPending && editingAssetId === unit.id
							}
						/>
					))}
				</div>
			)}
		</section>
	);
}
