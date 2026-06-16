import { useState } from "react";

import { Link, useLocation } from "@tanstack/react-router";

import { useGetUserProfile } from "@/features/auth/api/auth-queries";
import { ASSET_KIND_OPTIONS } from "@/features/livestock/constants/asset-kind-options";
import { CreateMaterialAssetDialog } from "@/features/livestock/components/create-material-asset-dialog";
import { CreateCropAssetDialog } from "@/features/crops/components/create-crop-asset-dialog";
import { CreateEquipmentAssetDialog } from "@/features/equipment/components/create-equipment-asset-dialog";
import { CreateLocationAssetDialog } from "@/features/location/components/create-location-asset-dialog";
import { LivestockAssetSearchBar } from "@/features/livestock/components/livestock-asset-search-bar";
import { LivestockUnitRow } from "@/features/livestock/components/livestock-unit-row";
import { useLivestockAssetEdit } from "@/features/livestock/components/use-livestock-asset-edit";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/empty-state";
import { LoadingState } from "@/components/common/loading-state";
import { useListLivestockAssetsByFarmId } from "@/features/livestock/api/livestock-queries";
import type { LivestockAssetKind } from "@/features/livestock/types/livestock-types";

export function LivestockKindPage({
	selectedKind,
}: {
	selectedKind: LivestockAssetKind;
}) {
	const location = useLocation();
	const [query, setQuery] = useState("");
	const { data: currentUser } = useGetUserProfile();
	const farmId = currentUser?.lastVisitedFarmId ?? "";

	const { data: farmAssetsResponse, isLoading } = useListLivestockAssetsByFarmId({
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

	const {
		editingAssetId,
		editName,
		editLocation,
		editDescription,
		deletingAssetId,
		isUpdatePending,
		startEdit,
		cancelEdit,
		saveEdit,
		setEditName,
		setEditLocation,
		setEditDescription,
		deleteAsset,
	} = useLivestockAssetEdit(farmId);

	const sourcePath =
		typeof window === "undefined"
			? location.pathname
			: `${location.pathname}${window.location.search}`;
	const activeKindMeta =
		ASSET_KIND_OPTIONS.find((option) => option.kind === selectedKind) ??
		ASSET_KIND_OPTIONS[0]!;
	const units = farmAssetsResponse?.data ?? [];

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
					<h1 className="text-2xl font-semibold">{activeKindMeta.title}</h1>
					<p className="text-sm text-[color:var(--v2-ink-soft)]">
						{farmAssetsResponse?.meta.total ?? units.length} {activeKindMeta.pluralLabel}
					</p>
				</div>
				{selectedKind === "animal" ? (
					<Button asChild variant="default" size="sm">
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
				) : selectedKind === "crop" ? (
					<CreateCropAssetDialog farmId={farmId} />
				) : selectedKind === "equipment" ? (
					<CreateEquipmentAssetDialog farmId={farmId} />
				) : selectedKind === "location" ? (
					<CreateLocationAssetDialog farmId={farmId} />
				) : null}
			</div>

			<LivestockAssetSearchBar
				value={query}
				onChange={setQuery}
				placeholder={`Buscar ${activeKindMeta.title.toLowerCase()} por nombre o ubicacion...`}
				ariaLabel={`Buscar ${activeKindMeta.title.toLowerCase()} por nombre o ubicacion`}
			/>

			{isLoading ? (
				<LoadingState
					message={`Cargando ${activeKindMeta.title.toLowerCase()}...`}
				/>
			) : units.length === 0 ? (
				<EmptyState
					title={
						query
							? `Sin resultados para "${query}"`
							: `Aun no hay ${activeKindMeta.title.toLowerCase()}`
					}
					description={
						query
							? "Prueba con otro nombre o ubicacion."
							: `Crea tu primer registro para empezar a hacer seguimiento.`
					}
				/>
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
								startEdit(unit.id, unit.name, unit.location, unit.description)
							}
							onCancelEdit={cancelEdit}
							onChangeName={setEditName}
							onChangeLocation={setEditLocation}
							onChangeDescription={setEditDescription}
							onSaveEdit={saveEdit}
							onDelete={() => deleteAsset(unit.id)}
							isDeleting={deletingAssetId === unit.id}
							isSaving={isUpdatePending && editingAssetId === unit.id}
						/>
					))}
				</div>
			)}
		</section>
	);
}
