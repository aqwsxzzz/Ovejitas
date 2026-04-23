import { Link } from "@tanstack/react-router";

import {
	getFinanceSummary,
	listEvents,
	listProductionUnits,
} from "@/shared/api/v2-mock-repository";

function formatCurrency(value: number): string {
	if (Math.abs(value) >= 1000) {
		return `$${(value / 1000).toFixed(1)}k`;
	}
	return `$${value}`;
}

function formatSignedCurrency(value: number): string {
	return `${value >= 0 ? "+" : "-"}${formatCurrency(Math.abs(value))}`;
}

function monthLabel(): string {
	return new Date().toLocaleDateString("es-EC", {
		month: "long",
		year: "numeric",
	});
}

export function V2FinancePage() {
	const summary = getFinanceSummary();
	const units = listProductionUnits();
	const txns = listEvents()
		.filter((event) => event.amount != null && event.status === "logged")
		.sort(
			(a, b) =>
				new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
		)
		.slice(0, 5);

	const ranking = units
		.map((unit) => {
			const unitEvents = listEvents({ unitId: unit.id });
			const income = unitEvents
				.filter((event) => event.type === "income")
				.reduce((sum, event) => sum + (event.amount ?? 0), 0);
			const expense = unitEvents
				.filter((event) => event.type === "expense")
				.reduce((sum, event) => sum + (event.amount ?? 0), 0);
			return {
				unitId: unit.id,
				unitName: unit.name,
				net: income - expense,
			};
		})
		.sort((a, b) => b.net - a.net);

	const bestUnit = ranking[0];
	const worstUnit = ranking[ranking.length - 1];

	const maxCategory = Math.max(
		...summary.costByCategory.map((item) => item.total),
		1,
	);

	return (
		<section className="space-y-4">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-semibold">Finanzas</h1>
				<span className="rounded-full border border-[color:var(--v2-border)] bg-white px-3 py-1 text-xs font-semibold text-[color:var(--v2-ink-soft)]">
					{monthLabel()}
				</span>
			</div>

			<div className="rounded-2xl border border-black/20 bg-[#f2df77] p-4 shadow-[0_10px_24px_-18px_rgba(0,0,0,0.45)]">
				<p className="text-[10px] uppercase tracking-[0.08em] text-[color:var(--v2-ink-soft)]">
					neto · mes actual
				</p>
				<p className="mt-2 text-5xl font-semibold leading-none">
					{formatSignedCurrency(summary.net)}
				</p>
				<div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-white/45 p-3">
					<div>
						<p className="text-xs uppercase tracking-[0.08em] text-emerald-700">
							entrada
						</p>
						<p className="text-lg font-semibold">
							{formatCurrency(summary.income)}
						</p>
					</div>
					<div>
						<p className="text-xs uppercase tracking-[0.08em] text-red-700">
							salida
						</p>
						<p className="text-lg font-semibold">
							{formatCurrency(summary.expense)}
						</p>
					</div>
				</div>
			</div>

			<article className="v2-card p-4">
				<p className="v2-kicker mb-2">En que se fue el dinero</p>
				<div className="space-y-2.5">
					{summary.costByCategory.map((item) => (
						<div key={item.categoryName}>
							<div className="mb-1 flex items-center justify-between text-sm">
								<span>{item.categoryName}</span>
								<span className="font-semibold">
									{formatCurrency(item.total)}
								</span>
							</div>
							<div className="h-2 overflow-hidden rounded-full bg-[color:var(--v2-border)]">
								<div
									className="h-full rounded-full bg-[color:var(--v2-primary)]"
									style={{
										width: `${Math.max((item.total / maxCategory) * 100, item.total > 0 ? 12 : 0)}%`,
									}}
								/>
							</div>
						</div>
					))}
				</div>
			</article>

			<article className="v2-card p-4">
				<p className="v2-kicker mb-2">Quien esta pagando</p>
				<div className="grid gap-2 md:grid-cols-2">
					<div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
						<p className="text-xs uppercase tracking-[0.08em] text-emerald-700">
							Mejor unidad
						</p>
						<p className="mt-1 font-semibold">
							{bestUnit?.unitName ?? "Sin datos"}
						</p>
						<p className="text-sm text-[color:var(--v2-ink-soft)]">
							{bestUnit ? formatSignedCurrency(bestUnit.net) : "—"}
						</p>
					</div>
					<div className="rounded-xl border border-red-200 bg-red-50 p-3">
						<p className="text-xs uppercase tracking-[0.08em] text-red-700">
							Mas presion
						</p>
						<p className="mt-1 font-semibold">
							{worstUnit?.unitName ?? "Sin datos"}
						</p>
						<p className="text-sm text-[color:var(--v2-ink-soft)]">
							{worstUnit ? formatSignedCurrency(worstUnit.net) : "—"}
						</p>
					</div>
				</div>
			</article>

			<article className="v2-card p-4">
				<div className="mb-2 flex items-center justify-between">
					<p className="v2-kicker">Movimientos recientes</p>
					<Link
						to="/v2/log"
						search={{
							actionId: "nuevo-movimiento",
							actionLabel: "Nuevo movimiento",
							contextLabel: "Finanzas",
							sourcePath: "/v2/finance",
						}}
						className="rounded-full border border-[color:var(--v2-ink)] px-3 py-1 text-xs font-semibold"
					>
						Nuevo movimiento
					</Link>
				</div>
				<div className="space-y-2">
					{txns.length === 0 ? (
						<p className="text-sm text-[color:var(--v2-ink-soft)]">
							Sin movimientos.
						</p>
					) : (
						txns.map((event) => (
							<div
								key={event.id}
								className="flex items-center justify-between rounded-lg border border-[color:var(--v2-border)] px-3 py-2"
							>
								<div className="min-w-0">
									<p className="truncate text-sm font-medium leading-tight">
										{event.notes ?? event.type}
									</p>
									<p className="text-xs text-[color:var(--v2-ink-soft)]">
										{new Date(event.occurredAt).toLocaleDateString("es-EC")}
									</p>
								</div>
								<p
									className={`text-sm font-semibold ${
										event.type === "income"
											? "text-emerald-700"
											: "text-red-700"
									}`}
								>
									{event.type === "income" ? "+" : "-"}
									{formatCurrency(event.amount ?? 0)}
								</p>
							</div>
						))
					)}
				</div>
			</article>
		</section>
	);
}
