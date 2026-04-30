import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useGetUserProfile } from "@/features/auth/api/auth-queries";
import { ProfitabilityReport } from "@/features/reports/components/profitability-report";
import { ProductionReport } from "@/features/reports/components/production-report";
import { IndividualTimelineReport } from "@/features/reports/components/individual-timeline-report";
import {
	ReportsFilterPanel,
	type ReportFilters,
} from "@/features/reports/components/reports-filter-panel";

export const Route = createFileRoute("/v2/reports")({
	component: ReportsPage,
});

function ReportsPage() {
	const { data: currentUser } = useGetUserProfile();
	const farmId = currentUser?.lastVisitedFarmId ?? "";
	const [activeFilters, setActiveFilters] = useState<ReportFilters | null>(
		null,
	);
	const resultsContentRef = useRef<HTMLDivElement | null>(null);

	const handleApplyFilters = (filters: ReportFilters) => {
		setActiveFilters(filters);
	};

	useEffect(() => {
		if (!activeFilters) return;

		requestAnimationFrame(() => {
			resultsContentRef.current?.scrollIntoView({
				behavior: "smooth",
				block: "start",
			});
		});
	}, [activeFilters]);

	return (
		<div className="space-y-6">
			<section className="v2-card p-5 md:p-6">
				<p className="v2-kicker">Analisis</p>
				<h2 className="mt-2 text-xl font-semibold">Reportes</h2>
				<p className="mt-1 text-sm text-[color:var(--v2-ink-soft)]">
					Resumenes operativos de rentabilidad y producción.
				</p>
			</section>

			<ReportsFilterPanel
				farmId={farmId}
				onApply={handleApplyFilters}
			/>

			{activeFilters && (
				<section className="space-y-4">
					<div className="v2-card p-4 md:p-5">
						<h3 className="text-base font-semibold">Resultados</h3>
						<p className="mt-1 text-sm text-muted-foreground">
							Mostrando resultados para el filtro aplicado.
						</p>
					</div>

					<div
						ref={resultsContentRef}
						className="space-y-4"
					>
						{activeFilters.scope !== "individual" ? (
							<>
								<ProfitabilityReport
									farmId={farmId}
									dateFrom={activeFilters.dateFrom}
									dateTo={activeFilters.dateTo}
									assetId={activeFilters.assetId}
								/>
								<ProductionReport
									farmId={farmId}
									eventType={activeFilters.eventType}
									bucket={activeFilters.bucket}
									dateFrom={activeFilters.dateFrom}
									dateTo={activeFilters.dateTo}
									assetId={activeFilters.assetId}
								/>
							</>
						) : (
							<IndividualTimelineReport
								farmId={farmId}
								individualId={activeFilters.individualId}
								eventType={activeFilters.eventType}
								dateFrom={activeFilters.dateFrom}
								dateTo={activeFilters.dateTo}
							/>
						)}
					</div>
				</section>
			)}
		</div>
	);
}
