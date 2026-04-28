import { useState } from "react";

import { useNavigate } from "@tanstack/react-router";

import { useGetUserProfile } from "@/features/auth/api/auth-queries";
import {
	deleteLivestockAssetById,
	updateLivestockAssetById,
} from "@/features/livestock/api/livestock-api";
import { useListLivestockAssetsByFarmId } from "@/features/livestock/api/livestock-queries";
import { AssetKindMedal } from "@/features/livestock/components/asset-kind-medal";
import type { LivestockAssetKind } from "@/features/livestock/types/livestock-types";

interface SearchBarProps {
	value: string;
	onChange: (value: string) => void;
}

function SearchBar({ value, onChange }: SearchBarProps) {
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
				placeholder="Buscar lote por nombre o ubicacion..."
				className="flex-1 bg-transparent text-sm outline-none placeholder:text-[color:var(--v2-ink-soft)]"
				aria-label="Buscar lotes por nombre o ubicacion"
			/>
		</div>
	);
}

function LivestockUnitRow(props: {
	id: number;
	name: string;
	kind: LivestockAssetKind;
	location: string | null;
	mode: "aggregated" | "individual";
	isEditing: boolean;
	editName: string;
	editLocation: string;
	onStartEdit: () => void;
	onCancelEdit: () => void;
	onChangeName: (value: string) => void;
	onChangeLocation: (value: string) => void;
	onSaveEdit: () => Promise<void>;
	onDelete: () => Promise<void>;
	isDeleting: boolean;
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
				<div className="flex items-center gap-2">
					<button
						type="button"
						onClick={() => void props.onSaveEdit()}
						className="rounded-full bg-[color:var(--v2-ink)] px-3 py-1 text-xs font-semibold text-white"
					>
						Guardar
					</button>
					<button
						type="button"
						onClick={props.onCancelEdit}
						className="rounded-full border border-[color:var(--v2-border)] px-3 py-1 text-xs font-semibold"
					>
						Cancelar
					</button>
				</div>
			</div>
		);
	}

	const openDetail = () => {
		if (isConfirmingDelete) return;

		navigate({
			to: "/v2/production-units/flock/$unitId",
			params: { unitId: String(props.id) },
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
						<p className="mt-1 text-sm text-[color:var(--v2-ink-soft)]">
							{props.location ?? "Sin ubicacion"}
						</p>
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
						<button
							type="button"
							onClick={() => setIsConfirmingDelete(false)}
							disabled={props.isDeleting}
							className="rounded-full border border-(--v2-border) px-3 py-1 text-xs font-semibold disabled:opacity-60"
						>
							Cancelar
						</button>
						<button
							type="button"
							onClick={() => void props.onDelete()}
							disabled={props.isDeleting}
							className="rounded-full border border-red-200 bg-red-100 px-3 py-1 text-xs font-semibold text-red-700 disabled:opacity-60"
						>
							{props.isDeleting ? "Eliminando..." : "Confirmar eliminar"}
						</button>
					</div>
				</div>
			) : null}
		</div>
	);
}

export function LivestockPage() {
	const [query, setQuery] = useState("");
	const [editingAssetId, setEditingAssetId] = useState<number | null>(null);
	const [editName, setEditName] = useState("");
	const [editLocation, setEditLocation] = useState("");
	const [deletingAssetId, setDeletingAssetId] = useState<number | null>(null);
	const { data: currentUser } = useGetUserProfile();
	const farmId = currentUser?.lastVisitedFarmId ?? "";

	const {
		data: farmAssetsResponse,
		isLoading,
		refetch,
	} = useListLivestockAssetsByFarmId({
		farmId,
		filters: {
			q: query.trim() || undefined,
			sort: "-updated_at",
			kind: "animal",
			page: 1,
			pageSize: 20,
		},
		enabled: !!farmId,
	});

	const units = farmAssetsResponse?.data ?? [];

	const handleStartEdit = (
		id: number,
		name: string,
		location: string | null,
	) => {
		setEditingAssetId(id);
		setEditName(name);
		setEditLocation(location ?? "");
	};

	const handleSaveEdit = async () => {
		if (!farmId || editingAssetId == null || !editName.trim()) return;

		await updateLivestockAssetById({
			farmId,
			assetId: editingAssetId,
			data: {
				name: editName.trim(),
				location: editLocation.trim() || null,
			},
		});

		setEditingAssetId(null);
		await refetch();
	};

	const handleDeleteAsset = async (assetId: number) => {
		if (!farmId) return;

		setDeletingAssetId(assetId);
		try {
			await deleteLivestockAssetById({ farmId, assetId });
			if (editingAssetId === assetId) {
				setEditingAssetId(null);
			}
			await refetch();
		} finally {
			setDeletingAssetId(null);
		}
	};

	if (!farmId) {
		return (
			<section className="space-y-4">
				<div className="v2-card p-5">
					<h1 className="text-2xl font-semibold">Ganado</h1>
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
					<h1 className="text-2xl font-semibold">Ganado</h1>
					<p className="text-sm text-[color:var(--v2-ink-soft)]">
						{farmAssetsResponse?.meta.total ?? units.length} lotes activos
					</p>
				</div>
			</div>

			<SearchBar
				value={query}
				onChange={setQuery}
			/>

			{isLoading ? (
				<p className="text-sm text-[color:var(--v2-ink-soft)]">
					Cargando lotes...
				</p>
			) : units.length === 0 ? (
				<p className="text-sm text-[color:var(--v2-ink-soft)]">
					No hay lotes reales que coincidan con "{query}".
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
							mode={unit.mode}
							isEditing={editingAssetId === unit.id}
							editName={editName}
							editLocation={editLocation}
							onStartEdit={() =>
								handleStartEdit(unit.id, unit.name, unit.location)
							}
							onCancelEdit={() => setEditingAssetId(null)}
							onChangeName={setEditName}
							onChangeLocation={setEditLocation}
							onSaveEdit={handleSaveEdit}
							onDelete={() => handleDeleteAsset(unit.id)}
							isDeleting={deletingAssetId === unit.id}
						/>
					))}
				</div>
			)}
		</section>
	);
}
