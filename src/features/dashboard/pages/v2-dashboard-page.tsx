import {
	getDashboardSnapshot,
	getUnitDashboardSlices,
} from "@/shared/api/v2-mock-repository";

import { UnitKpiSlider } from "../components/unit-kpi-slider";

const MONTH_LABEL = new Date().toLocaleDateString("es-EC", {
	month: "long",
	year: "numeric",
});

export function V2DashboardPage() {
	const snapshot = getDashboardSnapshot();
	const slices = getUnitDashboardSlices();

	return (
		<section className="space-y-4">
			{/* Page header */}
			<div>
				<p className="v2-kicker">{MONTH_LABEL}</p>
				<h1 className="mt-1 text-2xl font-semibold">{snapshot.farmName}</h1>
			</div>

			{/* Production unit slider — one card per unit */}
			<UnitKpiSlider slices={slices} />

			{/* Alerts */}
			{snapshot.urgentAlerts.length > 0 && (
				<article className="v2-card p-4">
					<p className="v2-kicker mb-3">Alertas urgentes</p>
					<div className="space-y-2">
						{snapshot.urgentAlerts.map((alert) => (
							<div
								key={alert.id}
								className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3"
							>
								<span
									className="mt-0.5 text-base"
									aria-hidden="true"
								>
									🔴
								</span>
								<div className="min-w-0">
									<p className="font-medium leading-tight">{alert.title}</p>
									<p className="mt-0.5 text-sm text-[color:var(--v2-ink-soft)]">
										{alert.description}
									</p>
								</div>
							</div>
						))}
					</div>
				</article>
			)}

			{/* Tareas de hoy */}
			<article className="v2-card p-4">
				<p className="v2-kicker mb-3">Tareas de hoy</p>
				{snapshot.todayTasks.length === 0 ? (
					<p className="text-sm text-[color:var(--v2-ink-soft)]">
						No hay pendientes.
					</p>
				) : (
					<div className="space-y-2">
						{snapshot.todayTasks.map((task) => (
							<div
								key={task.id}
								className="flex items-center gap-3 rounded-xl border border-[color:var(--v2-border)] p-3"
							>
								<span
									className={`h-2 w-2 shrink-0 rounded-full ${
										task.priority === "high"
											? "bg-red-500"
											: "bg-[color:var(--v2-primary)]"
									}`}
									aria-label={
										task.priority === "high"
											? "Prioridad alta"
											: "Prioridad normal"
									}
								/>
								<div className="min-w-0 flex-1">
									<p className="font-medium leading-tight">{task.title}</p>
									<p className="text-xs text-[color:var(--v2-ink-soft)]">
										{task.unitName}
									</p>
								</div>
							</div>
						))}
					</div>
				)}
			</article>
		</section>
	);
}
