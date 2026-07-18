import { Link } from "@tanstack/react-router";

import { LoadingState } from "@/components/common/loading-state";
import { useGetUserProfile } from "@/features/auth/api/auth-queries";
import { useGetLivestockAssetById } from "@/features/livestock/api/livestock-queries";
import { FlockHeaderCard } from "@/features/livestock/components/flock-detail/flock-header-card";
import { EquipmentTimelinePanel } from "@/features/equipment/components/equipment-timeline-panel";

interface EquipmentDetailPageProps {
	equipmentId: string;
}

export function EquipmentDetailPage({ equipmentId }: EquipmentDetailPageProps) {
	const parsedAssetId = Number(equipmentId);
	const hasValidAssetId = Number.isInteger(parsedAssetId) && parsedAssetId > 0;
	const { data: currentUser } = useGetUserProfile();
	const farmId = currentUser?.lastVisitedFarmId ?? "";

	const { data: asset, isLoading } = useGetLivestockAssetById({
		farmId,
		assetId: parsedAssetId,
		enabled: !!farmId && hasValidAssetId,
	});

	if (!farmId) {
		return (
			<p className="text-sm text-(--v2-ink-soft)">
				Selecciona una granja para cargar los detalles del equipo.
			</p>
		);
	}

	if (!hasValidAssetId) {
		return <p className="text-sm text-destructive">ID de equipo no válido.</p>;
	}

	if (isLoading) {
		return <LoadingState message="Cargando equipo..." />;
	}

	if (!asset || asset.kind !== "equipment") {
		return (
			<div className="space-y-2">
				<p className="text-sm text-destructive">Equipo no encontrado.</p>
				<Link
					to="/v2/production-units/$assetKind"
					params={{ assetKind: "equipment" }}
					className="text-sm underline"
				>
					Volver a equipos
				</Link>
			</div>
		);
	}

	return (
		<section className="space-y-4">
			<FlockHeaderCard asset={asset} />
			<EquipmentTimelinePanel
				farmId={farmId}
				equipmentId={equipmentId}
			/>
		</section>
	);
}
