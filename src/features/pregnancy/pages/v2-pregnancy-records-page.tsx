import { useState } from "react";

import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { LoadingState } from "@/components/common/loading-state";
import { Button } from "@/components/ui/button";
import { useGetUserProfile } from "@/features/auth/api/auth-queries";
import { useListPregnancies } from "@/features/pregnancy/api/pregnancy-queries";
import { PregnancyRecordRow } from "@/features/pregnancy/components/pregnancy-record-row";

const PAGE_SIZE = 20;

export function V2PregnancyRecordsPage() {
	const { data: currentUser } = useGetUserProfile();
	const farmId = currentUser?.lastVisitedFarmId ?? "";
	const [page, setPage] = useState(1);

	const { data, isPending, isError } = useListPregnancies({
		farmId,
		page,
		pageSize: PAGE_SIZE,
		enabled: !!farmId,
	});

	const records = data?.data ?? [];
	const hasNext = data?.meta.has_next ?? false;

	return (
		<section className="space-y-4">
			<div className="v2-card p-5 md:p-6">
				<h2 className="text-xl font-semibold">Registros de preñez</h2>
				<p className="mt-1 text-sm text-(--v2-ink-soft)">
					Controles de preñez/ecografía de la granja. Edita o elimina cada
					registro.
				</p>
			</div>

			{!farmId ? (
				<EmptyState title="Selecciona una granja para ver los registros." />
			) : isPending ? (
				<LoadingState message="Cargando registros..." />
			) : isError ? (
				<ErrorState description="No se pudieron cargar los registros de preñez." />
			) : records.length === 0 ? (
				<EmptyState title="Aún no hay registros de preñez." />
			) : (
				<div className="space-y-2">
					{records.map((record) => (
						<PregnancyRecordRow
							key={record.id}
							farmId={farmId}
							record={record}
						/>
					))}
				</div>
			)}

			{records.length > 0 ? (
				<div className="flex items-center justify-between">
					<Button
						type="button"
						variant="outline"
						size="sm"
						disabled={page === 1}
						onClick={() => setPage((current) => Math.max(1, current - 1))}
					>
						Anterior
					</Button>
					<span className="text-sm text-(--v2-ink-soft)">Página {page}</span>
					<Button
						type="button"
						variant="outline"
						size="sm"
						disabled={!hasNext}
						onClick={() => setPage((current) => current + 1)}
					>
						Siguiente
					</Button>
				</div>
			) : null}
		</section>
	);
}
