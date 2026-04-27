import { useMemo } from "react";

import { useGetUserProfile } from "@/features/auth/api/auth-queries";
import { useListLivestockAssetsByFarmId } from "@/features/livestock/api/livestock-queries";
import type { UnitDashboardSlice } from "@/shared/types/v2-domain-types";

import { UnitKpiSlider } from "../components/unit-kpi-slider";

const MONTH_LABEL = new Date().toLocaleDateString("es-EC", {
	month: "long",
	year: "numeric",
});

function mapAssetToSlice(asset: {
	id: number;
	name: string;
	kind: string;
	mode: "aggregated" | "individual";
}): UnitDashboardSlice {
	return {
		unitId: String(asset.id),
		unitName: asset.name,
		categoryLabel: asset.kind,
		mode: asset.mode === "aggregated" ? "aggregate" : "individual",
		status: "active",
		kpis: [
			{ label: "Animales", value: "Sin dato" },
			{ label: "Produccion", value: "Sin dato" },
			{ label: "Neto", value: "Sin dato" },
			{ label: "Alimento", value: "Sin dato" },
		],
	};
}

export function V2DashboardPage() {
	const { data: currentUser } = useGetUserProfile();
	const farmId = currentUser?.lastVisitedFarmId ?? "";

	const { data: farmAssetsResponse, isLoading } =
		useListLivestockAssetsByFarmId({
			farmId,
			filters: { kind: "animal", page: 1, pageSize: 20 },
			enabled: !!farmId,
		});

	const slices = useMemo(
		() =>
			(farmAssetsResponse?.data ?? []).map((asset) => mapAssetToSlice(asset)),
		[farmAssetsResponse],
	);

	return (
		<section className="space-y-4">
			<div>
				<p className="v2-kicker">{MONTH_LABEL}</p>
				<h1 className="mt-1 text-2xl font-semibold">Dashboard</h1>
			</div>

			{!farmId ? (
				<article className="v2-card p-4">
					<p className="text-sm text-[color:var(--v2-ink-soft)]">
						Selecciona una granja para cargar datos reales del dashboard.
					</p>
				</article>
			) : isLoading ? (
				<article className="v2-card p-4">
					<p className="text-sm text-[color:var(--v2-ink-soft)]">
						Cargando unidades reales...
					</p>
				</article>
			) : slices.length === 0 ? (
				<article className="v2-card p-4">
					<p className="text-sm text-[color:var(--v2-ink-soft)]">
						No hay unidades de produccion reales para mostrar.
					</p>
				</article>
			) : (
				<UnitKpiSlider slices={slices} />
			)}

			<article className="v2-card p-4">
				<p className="v2-kicker mb-3">Alertas urgentes</p>
				<p className="text-sm text-[color:var(--v2-ink-soft)]">
					Las alertas se mostraran cuando el backend de reportes este disponible
					para este modulo.
				</p>
			</article>

			<article className="v2-card p-4">
				<p className="v2-kicker mb-3">Tareas de hoy</p>
				<p className="text-sm text-[color:var(--v2-ink-soft)]">
					No hay tareas con datos reales disponibles en esta vista.
				</p>
			</article>
		</section>
	);
}
