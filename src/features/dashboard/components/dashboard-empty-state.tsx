import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";

interface Step {
	number: number;
	title: string;
	description: string;
	cta: React.ReactNode;
}

function EmptyStateStep({ number, title, description, cta }: Step) {
	return (
		<div className="flex items-start gap-4">
			<span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-(--v2-surface-raised) text-sm font-semibold text-(--v2-ink-soft)">
				{number}
			</span>
			<div className="flex-1 space-y-1">
				<p className="text-sm font-medium">{title}</p>
				<p className="text-xs text-(--v2-ink-soft)">{description}</p>
			</div>
			{cta}
		</div>
	);
}

interface DashboardEmptyStateProps {
	sourcePath: string;
}

export function DashboardEmptyState({ sourcePath }: DashboardEmptyStateProps) {
	return (
		<article className="v2-card space-y-6 p-5">
			<div>
				<p className="v2-kicker">Primeros pasos</p>
				<h2 className="mt-1 text-lg font-semibold">Bienvenido a Ovejitas</h2>
				<p className="mt-1 text-sm text-(--v2-ink-soft)">
					Aun no tienes unidades de produccion. Sigue estos pasos para empezar.
				</p>
			</div>

			<div className="space-y-5">
				<EmptyStateStep
					number={1}
					title="Crear tu primer lote de animales"
					description="Registra un lote con el conteo inicial de cabezas para empezar a hacer seguimiento."
					cta={
						<Button asChild variant="default" size="sm" className="shrink-0">
							<Link
								to="/v2/log"
								search={{
									actionId: "nuevo-lote",
									actionLabel: "Nuevo lote",
									contextLabel: "Animales",
									sourcePath,
								}}
							>
								Crear lote
							</Link>
						</Button>
					}
				/>

				<EmptyStateStep
					number={2}
					title="Registrar un material o insumo"
					description="Agrega alimento, medicamentos u otros materiales que usas en la granja."
					cta={
						<Button asChild variant="outline" size="sm" className="shrink-0">
							<Link to="/v2/production-units/$assetKind" params={{ assetKind: "material" }}>
								Ver materiales
							</Link>
						</Button>
					}
				/>

				<EmptyStateStep
					number={3}
					title="Agregar un equipo"
					description="Registra maquinaria, herramientas o infraestructura que forma parte de tu operacion."
					cta={
						<Button asChild variant="outline" size="sm" className="shrink-0">
							<Link to="/v2/production-units/$assetKind" params={{ assetKind: "equipment" }}>
								Ver equipos
							</Link>
						</Button>
					}
				/>
			</div>
		</article>
	);
}
