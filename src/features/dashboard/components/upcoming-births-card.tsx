import { useMemo } from "react";

import {
	formatBirthCountdown,
	toSortedBirthAlerts,
	type BirthAlert,
} from "@/features/dashboard/utils/birth-alert-utils";
import { useGetUpcomingBirthsReport } from "@/features/reports/api/reports-queries";
import { toDateParamOffsetDays } from "@/lib/datetime";

interface UpcomingBirthsCardProps {
	farmId: string;
	/** Size of the forward alert window in days (from now). */
	windowDays?: number;
	/**
	 * How far back to look for births that were due and never closed out. The
	 * report filters `expected_due_at >= date_from`, so overdue rows are only
	 * returned when the window starts in the past.
	 */
	overdueWindowDays?: number;
}

function formatDueDate(iso: string): string {
	return new Date(iso).toLocaleDateString("es", {
		day: "numeric",
		month: "short",
	});
}

const BADGE_TONE: Record<BirthAlert["severity"], string> = {
	overdue: "bg-destructive/15 text-destructive",
	imminent: "bg-(--v2-sage-50) text-(--v2-emerald-700)",
	upcoming: "bg-(--v2-surface) text-(--v2-ink-soft)",
};

function BirthAlertRow({ alert }: { alert: BirthAlert }) {
	const { row } = alert;
	return (
		<li className="flex items-center justify-between rounded-lg border border-(--v2-border) px-3 py-2 text-sm">
			<div className="min-w-0">
				<p className="font-medium">{row.individual_tag}</p>
				<p className="text-(--v2-ink-soft)">
					{formatDueDate(row.expected_due_at)}
					{row.offspring_count != null
						? ` · ${row.offspring_count} crías est.`
						: ""}
				</p>
			</div>
			<span
				className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${BADGE_TONE[alert.severity]}`}
			>
				{formatBirthCountdown(alert)}
			</span>
		</li>
	);
}

export function UpcomingBirthsCard({
	farmId,
	windowDays = 30,
	overdueWindowDays = 30,
}: UpcomingBirthsCardProps) {
	// Bare dates so the window opens on the farm's today, not the load instant.
	const { date_from, date_to } = useMemo(
		() => ({
			date_from: toDateParamOffsetDays(-overdueWindowDays),
			date_to: toDateParamOffsetDays(windowDays),
		}),
		[overdueWindowDays, windowDays],
	);

	const { data, isLoading } = useGetUpcomingBirthsReport({
		farmId,
		date_from,
		date_to,
	});

	const alerts = useMemo(
		() => toSortedBirthAlerts(data?.data ?? []),
		[data?.data],
	);
	const overdueCount = alerts.filter(
		(alert) => alert.severity === "overdue",
	).length;

	return (
		<article className="v2-card p-4">
			<div className="mb-3 flex items-center justify-between gap-2">
				<p className="v2-kicker">Próximos partos</p>
				{overdueCount > 0 ? (
					<span className="rounded-full bg-destructive/15 px-2.5 py-0.5 text-xs font-semibold text-destructive">
						{overdueCount} vencido{overdueCount === 1 ? "" : "s"}
					</span>
				) : null}
			</div>
			{isLoading ? (
				<p className="text-sm text-(--v2-ink-soft)">
					Cargando próximos partos...
				</p>
			) : alerts.length === 0 ? (
				<p className="text-sm text-(--v2-ink-soft)">
					No hay partos previstos en los próximos {windowDays} días.
				</p>
			) : (
				<ul className="space-y-2">
					{alerts.map((alert) => (
						<BirthAlertRow
							key={alert.row.individual_id}
							alert={alert}
						/>
					))}
				</ul>
			)}
		</article>
	);
}
