import { Link } from "@tanstack/react-router";
import { LoadingState } from "@/components/common/loading-state";

import { useGetUserProfile } from "@/features/auth/api/auth-queries";
import { useGetLivestockAssetById } from "@/features/livestock/api/livestock-queries";
import { FlockHeaderCard } from "@/features/livestock/components/flock-detail/flock-header-card";
import { LocationTimelinePanel } from "@/features/location/components/location-timeline-panel";

interface LocationDetailPageProps {
	locationId: string;
}

export function LocationDetailPage({ locationId }: LocationDetailPageProps) {
	const parsedAssetId = Number(locationId);
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
				Selecciona una granja para cargar los detalles de la ubicación.
			</p>
		);
	}

	if (!hasValidAssetId) {
		return (
			<p className="text-sm text-destructive">ID de ubicación no válido.</p>
		);
	}

	if (isLoading) {
		return <LoadingState message="Cargando ubicación..." />;
	}

	if (!asset || asset.kind !== "location") {
		return (
			<div className="space-y-2">
				<p className="text-sm text-destructive">Ubicación no encontrada.</p>
				<Link
					to="/v2/production-units/$assetKind"
					params={{ assetKind: "location" }}
					className="text-sm underline"
				>
					Volver a ubicaciones
				</Link>
			</div>
		);
	}

	return (
		<section className="space-y-4">
			<FlockHeaderCard asset={asset} />
			<LocationTimelinePanel
				farmId={farmId}
				locationId={locationId}
			/>
		</section>
	);
}
