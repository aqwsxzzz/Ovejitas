import { useState } from "react";
import { MapPin, Package } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/empty-state";
import { Input } from "@/components/ui/input";
import { LoadingState } from "@/components/common/loading-state";
import { Textarea } from "@/components/ui/textarea";

import { useGetUserProfile } from "@/features/auth/api/auth-queries";
import {
	useDeleteLivestockAssetById,
	useListLivestockAssetsByFarmId,
	useUpdateLivestockAssetById,
} from "@/features/livestock/api/livestock-queries";

interface SearchBarProps {
	value: string;
	onChange: (value: string) => void;
}

function SearchBar({ value, onChange }: SearchBarProps) {
	return (
		<div className="flex items-center gap-2 rounded-xl border border-dashed border-(--v2-border) bg-white px-3 py-2.5">
			<span
				className="text-base"
				aria-hidden="true"
			>
				🔍
			</span>
			<Input
				type="search"
				value={value}
				onChange={(event) => onChange(event.target.value)}
				placeholder="Buscar material por nombre o ubicacion..."
				className="h-auto flex-1 border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0"
				aria-label="Buscar materiales"
			/>
		</div>
	);
}

function MaterialAssetRow(props: {
	id: number;
	name: string;
	location: string | null;
	description: string | null;
	isEditing: boolean;
	isDeleting: boolean;
	isSaving: boolean;
	editName: string;
	editLocation: string;
	editDescription: string;
	onStartEdit: () => void;
	onCancelEdit: () => void;
	onSaveEdit: () => Promise<void>;
	onDelete: () => Promise<void>;
	onChangeName: (value: string) => void;
	onChangeLocation: (value: string) => void;
	onChangeDescription: (value: string) => void;
}) {
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
						placeholder="Nombre del material"
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
		navigate({
			to: "/v2/inventory/materials/$materialId",
			params: { materialId: String(props.id) },
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
					<div
						className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-warning/10 text-warning ring-1 ring-warning/30"
						aria-label="Material"
						title="Material"
					>
						<Package className="h-5 w-5" />
					</div>
					<div className="min-w-0">
						<div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
							<p className="font-semibold leading-tight">{props.name}</p>
							{props.location ? (
								<span className="flex items-center gap-1 text-sm text-(--v2-ink-soft)">
									<MapPin className="h-3.5 w-3.5 shrink-0" />
									{props.location}
								</span>
							) : null}
						</div>
						{props.description ? (
							<p className="mt-1 line-clamp-2 text-sm text-(--v2-ink-soft)">
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
					<p className="text-sm font-medium text-destructive">
						Eliminar este material?
					</p>
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

export function InventoryPage() {
	const [query, setQuery] = useState("");
	const [editingAssetId, setEditingAssetId] = useState<number | null>(null);
	const [editName, setEditName] = useState("");
	const [editLocation, setEditLocation] = useState("");
	const [editDescription, setEditDescription] = useState("");
	const [deletingAssetId, setDeletingAssetId] = useState<number | null>(null);
	const { data: currentUser } = useGetUserProfile();
	const farmId = currentUser?.lastVisitedFarmId ?? "";

	const { data: materialAssetsResponse, isLoading } =
		useListLivestockAssetsByFarmId({
			farmId,
			filters: {
				q: query.trim() || undefined,
				sort: "-updated_at",
				kind: "material",
				page: 1,
				pageSize: 20,
			},
			enabled: !!farmId,
		});

	const updateAssetMutation = useUpdateLivestockAssetById();
	const deleteAssetMutation = useDeleteLivestockAssetById();
	const materials = materialAssetsResponse?.data ?? [];

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
					<h1 className="text-2xl font-semibold">Inventario</h1>
					<p className="mt-1 text-sm text-(--v2-ink-soft)">
						Selecciona una granja para cargar materiales reales.
					</p>
				</div>
			</section>
		);
	}

	return (
		<section className="space-y-4">
			<div className="flex items-center justify-between">
				<div>
					<p className="v2-kicker">Inventario</p>
					<h1 className="mt-1 text-2xl font-semibold">Materiales</h1>
					<p className="text-sm text-(--v2-ink-soft)">
						{materialAssetsResponse?.meta.total ?? materials.length} materiales
					</p>
				</div>
			</div>

			<SearchBar
				value={query}
				onChange={setQuery}
			/>

			{isLoading ? (
				<LoadingState message="Cargando materiales..." />
			) : materials.length === 0 ? (
				<EmptyState
					title={
						query ? `Sin resultados para "${query}"` : "Aun no hay materiales"
					}
					description={
						query
							? "Prueba con otro nombre o ubicacion."
							: "Crea tu primer material para empezar a controlar el stock."
					}
				/>
			) : (
				<div className="space-y-2">
					{materials.map((material) => (
						<MaterialAssetRow
							key={material.id}
							id={material.id}
							name={material.name}
							location={material.location}
							description={material.description}
							isEditing={editingAssetId === material.id}
							isDeleting={deletingAssetId === material.id}
							isSaving={
								updateAssetMutation.isPending && editingAssetId === material.id
							}
							editName={editName}
							editLocation={editLocation}
							editDescription={editDescription}
							onStartEdit={() =>
								handleStartEdit(
									material.id,
									material.name,
									material.location,
									material.description,
								)
							}
							onCancelEdit={() => setEditingAssetId(null)}
							onSaveEdit={handleSaveEdit}
							onDelete={() => handleDeleteAsset(material.id)}
							onChangeName={setEditName}
							onChangeLocation={setEditLocation}
							onChangeDescription={setEditDescription}
						/>
					))}
				</div>
			)}
		</section>
	);
}
