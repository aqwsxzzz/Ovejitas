import { useMemo } from "react";

import { useGetUpcomingBirthsReport } from "@/features/reports/api/reports-queries";
import { toDateParam, toDateParamOffsetDays } from "@/lib/datetime";

interface UpcomingBirthsCardProps {
	farmId: string;
	/** Size of the alert window in days (from now). */
	windowDays?: number;
}

function formatDueDate(iso: string): string {
	return new Date(iso).toLocaleDateString("es", {
		day: "numeric",
		month: "short",
	});
}

export function UpcomingBirthsCard({
	farmId,
	windowDays = 30,
}: UpcomingBirthsCardProps) {
	// Bare dates so the window opens on the farm's today, not the load instant —
	// `days_until_due` counts from `date_from`, so a mid-day instant would round
	// every countdown against a partial first day.
	const { date_from, date_to } = useMemo(
		() => ({
			date_from: toDateParam(),
			date_to: toDateParamOffsetDays(windowDays),
		}),
		[windowDays],
	);

	const { data, isLoading } = useGetUpcomingBirthsReport({
		farmId,
		date_from,
		date_to,
	});

	const rows = data?.data ?? [];

	return (
		<article className="v2-card p-4">
			<p className="v2-kicker mb-3">Próximos partos</p>
			{isLoading ? (
				<p className="text-sm text-(--v2-ink-soft)">Cargando próximos partos...</p>
			) : rows.length === 0 ? (
				<p className="text-sm text-(--v2-ink-soft)">
					No hay partos previstos en los próximos {windowDays} días.
				</p>
			) : (
				<ul className="space-y-2">
					{rows.map((row) => (
						<li
							key={row.individual_id}
							className="flex items-center justify-between rounded-lg border border-(--v2-border) px-3 py-2 text-sm"
						>
							<div className="min-w-0">
								<p className="font-medium">{row.individual_tag}</p>
								<p className="text-(--v2-ink-soft)">
									{formatDueDate(row.expected_due_at)}
									{row.offspring_count != null
										? ` · ${row.offspring_count} crías est.`
										: ""}
								</p>
							</div>
							<span className="rounded-full bg-(--v2-surface) px-2.5 py-0.5 text-xs font-semibold text-(--v2-ink-soft)">
								{row.days_until_due <= 0
									? "Hoy"
									: `en ${row.days_until_due} d`}
							</span>
						</li>
					))}
				</ul>
			)}
		</article>
	);
}
