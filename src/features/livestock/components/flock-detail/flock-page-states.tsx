import { Link } from "@tanstack/react-router";
import { LoadingState } from "@/components/common/loading-state";

export function FlockSelectFarmState() {
	return (
		<section className="space-y-4">
			<div className="v2-card p-5">
				<p className="v2-kicker">Activos</p>
				<h1 className="mt-2 text-xl font-semibold">Selecciona una granja</h1>
				<p className="mt-1 text-sm text-(--v2-ink-soft)">
					No hay granja activa para cargar datos reales.
				</p>
			</div>
		</section>
	);
}

export function FlockLoadingAssetState() {
	return (
		<section className="space-y-4">
			<div className="v2-card p-5">
				<LoadingState message="Cargando activo..." />
			</div>
		</section>
	);
}

export function FlockAssetNotFoundState() {
	return (
		<section className="space-y-4">
			<div className="v2-card p-5">
				<p className="v2-kicker">Activos</p>
				<h1 className="mt-2 text-xl font-semibold">Activo no encontrado</h1>
				<p className="mt-1 text-sm text-(--v2-ink-soft)">
					No encontramos el activo solicitado.
				</p>
				<Link
					to="/v2/production-units"
					className="mt-4 inline-flex rounded-full border border-(--v2-ink) px-3 py-1.5 text-xs font-semibold"
				>
					Volver a activos
				</Link>
			</div>
		</section>
	);
}
