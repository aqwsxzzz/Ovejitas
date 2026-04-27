import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { useGetUserProfile } from "@/features/auth/api/auth-queries";
import {
	listEventsByAssetId,
	listLivestockAssetsByFarmId,
} from "@/features/livestock/api/livestock-api";

type FinanceMovement = {
	id: string;
	notes: string;
	occurredAt: string;
	type: "income" | "expense";
	amount: number;
};

type UnitNet = {
	unitId: number;
	unitName: string;
	net: number;
};

type FinanceSnapshot = {
	income: number;
	expense: number;
	net: number;
	costByCategory: Array<{ categoryName: string; total: number }>;
	txns: FinanceMovement[];
	ranking: UnitNet[];
};

function isLoggedEvent(payload: Record<string, unknown> | undefined): boolean {
	if (!payload) return true;
	const status = payload.status;
	if (typeof status !== "string") return true;
	return status === "logged";
}

function formatCurrency(value: number): string {
	if (Math.abs(value) >= 1000) {
		return `$${(value / 1000).toFixed(1)}k`;
	}
	return `$${value.toFixed(2)}`;
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

async function fetchFinanceSnapshot(farmId: string): Promise<FinanceSnapshot> {
	const assetsResponse = await listLivestockAssetsByFarmId({
		farmId,
		filters: { kind: "animal", mode: "aggregated", pageSize: 100 },
	});
	const assets = assetsResponse.data;

	const eventResponses = await Promise.all(
		assets.map((asset) =>
			listEventsByAssetId({
				farmId,
				assetId: String(asset.id),
				filters: { pageSize: 100, sort: "-occurred_at" },
			}),
		),
	);

	const allEvents = eventResponses.flatMap((response, index) =>
		response.data.map((event) => ({
			event,
			unitId: assets[index]?.id ?? 0,
			unitName: assets[index]?.name ?? "Sin unidad",
		})),
	);

	const moneyEvents = allEvents.filter(({ event }) => {
		if (event.type !== "income" && event.type !== "expense") return false;
		return isLoggedEvent(event.payload as Record<string, unknown> | undefined);
	});

	const income = moneyEvents.reduce(
		(sum, { event }) =>
			sum + (event.type === "income" ? Number(event.amount ?? 0) : 0),
		0,
	);
	const expense = moneyEvents.reduce(
		(sum, { event }) =>
			sum + (event.type === "expense" ? Number(event.amount ?? 0) : 0),
		0,
	);

	const costByCategoryMap = new Map<string, number>();
	for (const { event } of moneyEvents) {
		if (event.type !== "expense") continue;
		const key =
			event.category_id != null
				? `Categoria ${event.category_id}`
				: "Sin categoria";
		costByCategoryMap.set(
			key,
			(costByCategoryMap.get(key) ?? 0) + Number(event.amount ?? 0),
		);
	}

	const txns = moneyEvents
		.sort(
			(a, b) =>
				new Date(b.event.occurred_at).getTime() -
				new Date(a.event.occurred_at).getTime(),
		)
		.slice(0, 5)
		.map(({ event }) => ({
			id: String(event.id),
			notes: event.notes ?? event.type,
			occurredAt: event.occurred_at,
			type: event.type as "income" | "expense",
			amount: Number(event.amount ?? 0),
		}));

	const netByUnit = new Map<number, UnitNet>();
	for (const { event, unitId, unitName } of moneyEvents) {
		const previous = netByUnit.get(unitId) ?? { unitId, unitName, net: 0 };
		const amount = Number(event.amount ?? 0);
		const delta = event.type === "income" ? amount : -amount;
		netByUnit.set(unitId, { ...previous, net: previous.net + delta });
	}

	return {
		income,
		expense,
		net: income - expense,
		costByCategory: Array.from(costByCategoryMap.entries())
			.map(([categoryName, total]) => ({ categoryName, total }))
			.sort((a, b) => b.total - a.total),
		txns,
		ranking: Array.from(netByUnit.values()).sort((a, b) => b.net - a.net),
	};
}

export function V2FinancePage() {
	const { data: currentUser } = useGetUserProfile();
	const farmId = currentUser?.lastVisitedFarmId ?? "";

	const { data: snapshot, isLoading } = useQuery({
		queryKey: ["v2", "finance", "snapshot", farmId],
		queryFn: () => fetchFinanceSnapshot(farmId),
		enabled: !!farmId,
	});

	const summary = snapshot ?? {
		income: 0,
		expense: 0,
		net: 0,
		costByCategory: [],
		txns: [],
		ranking: [],
	};

	const bestUnit = summary.ranking[0];
	const worstUnit = summary.ranking[summary.ranking.length - 1];
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

			{!farmId ? (
				<article className="v2-card p-4">
					<p className="text-sm text-[color:var(--v2-ink-soft)]">
						Selecciona una granja para cargar datos financieros reales.
					</p>
				</article>
			) : null}

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
				{isLoading ? (
					<p className="text-sm text-[color:var(--v2-ink-soft)]">
						Cargando movimientos...
					</p>
				) : summary.costByCategory.length === 0 ? (
					<p className="text-sm text-[color:var(--v2-ink-soft)]">
						No hay gastos reales registrados.
					</p>
				) : (
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
				)}
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
					{summary.txns.length === 0 ? (
						<p className="text-sm text-[color:var(--v2-ink-soft)]">
							Sin movimientos.
						</p>
					) : (
						summary.txns.map((event) => (
							<div
								key={event.id}
								className="flex items-center justify-between rounded-lg border border-[color:var(--v2-border)] px-3 py-2"
							>
								<div className="min-w-0">
									<p className="truncate text-sm font-medium leading-tight">
										{event.notes}
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
									{formatCurrency(event.amount)}
								</p>
							</div>
						))
					)}
				</div>
			</article>
		</section>
	);
}
