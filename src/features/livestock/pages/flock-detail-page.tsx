import { Link } from "@tanstack/react-router";

import { useGetUserProfile } from "@/features/auth/api/auth-queries";
import { useGetLivestockAssetById } from "@/features/livestock/api/livestock-queries";
import { getFlockDetailSnapshot } from "@/shared/api/v2-mock-repository";
import type {
	FlockDetailSnapshot,
	UnitMode,
} from "@/shared/types/v2-domain-types";
import type { ILivestockAsset } from "@/features/livestock/types/livestock-types";

function formatMoney(value: number): string {
	const sign = value >= 0 ? "+" : "-";
	return `${sign}$${Math.abs(value)}`;
}

function Bars({ data }: { data: number[] }) {
	const max = Math.max(...data, 1);
	return (
		<div className="mt-3 flex h-10 items-end gap-1.5">
			{data.map((value, index) => (
				<div
					key={`${value}-${index}`}
					className={`flex-1 rounded-t-sm border border-black/20 ${
						index === data.length - 1
							? "bg-[#f2df77]"
							: index % 2 === 0
								? "bg-[#1f211d]"
								: "bg-[#8a8677]"
					}`}
					style={{ height: `${Math.max((value / max) * 100, 20)}%` }}
				/>
			))}
		</div>
	);
}

function MetricCard(props: { label: string; value: string; note: string }) {
	return (
		<div className="v2-card flex-1 p-3">
			<p className="text-[10px] uppercase tracking-[0.08em] text-[color:var(--v2-ink-soft)]">
				{props.label}
			</p>
			<p className="mt-1 text-2xl font-semibold leading-none">{props.value}</p>
			<p className="mt-1 text-sm text-[color:var(--v2-ink-soft)]">
				{props.note}
			</p>
		</div>
	);
}

interface FlockDetailPageProps {
	unitId: string;
}

const toUnitMode = (mode: ILivestockAsset["mode"]): UnitMode =>
	mode === "aggregated" ? "aggregate" : "individual";

const toFallbackSnapshot = (asset: ILivestockAsset): FlockDetailSnapshot => ({
	unitId: String(asset.id),
	unitName: asset.name,
	breedLabel: `${asset.kind} · ${toUnitMode(asset.mode)}`,
	headCount: 0,
	capacity: 0,
	location: asset.location ?? undefined,
	eggsLast7Days: 0,
	layRate: 0,
	dailyEggSeries: [0, 0, 0, 0, 0, 0, 0],
	todayEggCount: 0,
	lossesLabel: "Sin datos historicos",
	netMonth: 0,
	financeNote: "Eventos y reportes pendientes en BE",
	recentEvents: [],
});

export function FlockDetailPage({ unitId }: FlockDetailPageProps) {
	const { data: currentUser } = useGetUserProfile();
	const mockSnapshot = getFlockDetailSnapshot(unitId);
	const parsedAssetId = Number(unitId);
	const hasValidAssetId = Number.isInteger(parsedAssetId);
	const farmId = currentUser?.lastVisitedFarmId ?? "";

	const { data: asset, isFetching: isAssetFetching } = useGetLivestockAssetById(
		{
			farmId,
			assetId: parsedAssetId,
			enabled: hasValidAssetId && !!farmId,
		},
	);

	const snapshot = mockSnapshot ?? (asset ? toFallbackSnapshot(asset) : null);

	if (!mockSnapshot && hasValidAssetId && !asset && isAssetFetching) {
		return (
			<section className="space-y-4">
				<div className="v2-card p-5">
					<p className="text-sm text-[color:var(--v2-ink-soft)]">
						Cargando lote...
					</p>
				</div>
			</section>
		);
	}

	if (!snapshot) {
		return (
			<section className="space-y-4">
				<div className="v2-card p-5">
					<p className="v2-kicker">Lotes</p>
					<h1 className="mt-2 text-xl font-semibold">Lote no encontrado</h1>
					<p className="mt-1 text-sm text-[color:var(--v2-ink-soft)]">
						No encontramos el lote solicitado.
					</p>
					<Link
						to="/v2/production-units"
						className="mt-4 inline-flex rounded-full border border-[color:var(--v2-ink)] px-3 py-1.5 text-xs font-semibold"
					>
						Volver a ganado
					</Link>
				</div>
			</section>
		);
	}

	return (
		<section className="space-y-4">
			<div className="v2-card p-5">
				<div className="flex items-start justify-between gap-3">
					<div>
						<div className="flex items-center gap-2">
							<Link
								to="/v2/production-units"
								className="text-sm text-[color:var(--v2-ink-soft)]"
							>
								‹
							</Link>
							<h1 className="text-2xl font-semibold">{snapshot.unitName}</h1>
						</div>
						<p className="mt-2 text-sm italic text-[color:var(--v2-ink-soft)]">
							{snapshot.breedLabel} · {snapshot.headCount} aves ·{" "}
							{snapshot.location}
						</p>
					</div>
					<span className="text-[color:var(--v2-ink-soft)]">···</span>
				</div>
			</div>

			<div className="rounded-2xl border border-black/20 bg-[#f2df77] p-4 shadow-[0_10px_24px_-18px_rgba(0,0,0,0.45)]">
				<p className="text-[10px] uppercase tracking-[0.08em] text-[color:var(--v2-ink-soft)]">
					Huevos · ultimos 7 dias
				</p>
				<div className="mt-2 flex items-start justify-between gap-3">
					<p className="text-5xl font-semibold leading-none">
						{snapshot.eggsLast7Days}
					</p>
					<div className="text-right text-sm text-[color:var(--v2-ink-soft)]">
						<p className="text-xl font-semibold leading-none text-[color:var(--v2-ink)]">
							{snapshot.layRate}%
						</p>
						<p>tasa de postura</p>
					</div>
				</div>
				<Bars data={snapshot.dailyEggSeries} />
				<div className="mt-2 flex items-center justify-between text-[11px] uppercase tracking-[0.08em] text-[color:var(--v2-ink-soft)]">
					<span>Lun</span>
					<span>Hoy · {snapshot.todayEggCount}</span>
				</div>
			</div>

			<div className="grid gap-3 md:grid-cols-2">
				<MetricCard
					label="Conteo"
					value={`${snapshot.headCount} / ${snapshot.capacity}`}
					note={snapshot.lossesLabel}
				/>
				<MetricCard
					label="Neto · abr"
					value={formatMoney(snapshot.netMonth)}
					note={snapshot.financeNote}
				/>
			</div>

			<div>
				<p className="v2-kicker mb-2">Eventos recientes</p>
				<div className="v2-card p-4">
					{snapshot.recentEvents.length === 0 ? (
						<p className="text-sm text-[color:var(--v2-ink-soft)]">
							No hay eventos recientes.
						</p>
					) : (
						<div className="space-y-2 text-sm">
							{snapshot.recentEvents.map((event) => (
								<p key={event.id}>
									{event.dateLabel} ·{" "}
									<span className="font-semibold">{event.title}</span>
									{event.detail ? ` · ${event.detail}` : ""}
								</p>
							))}
						</div>
					)}
				</div>
			</div>
		</section>
	);
}
