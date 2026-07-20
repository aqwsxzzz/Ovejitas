import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { LoadingState } from "@/components/common/loading-state";
import { MaterialPaginationControls } from "@/features/inventory/components/material-pagination-controls";

import { ManualFeedingHistoryRange } from "./manual-feeding-history-range";
import { ManualFeedingHistoryRow } from "./manual-feeding-history-row";
import { useManualFeedingHistory } from "./use-manual-feeding-history";

interface ManualFeedingHistoryProps {
	farmId: string;
	consumerAssetId: number;
	materialNameById: Map<number, string>;
}

export function ManualFeedingHistory({
	farmId,
	consumerAssetId,
	materialNameById,
}: ManualFeedingHistoryProps) {
	const [isOpen, setIsOpen] = useState(false);
	const history = useManualFeedingHistory({
		farmId,
		consumerAssetId,
		enabled: isOpen,
	});

	const isEmpty =
		!history.isLoading && !history.error && history.rows.length === 0;

	return (
		<div className="space-y-3">
			<Button
				type="button"
				variant="outline"
				size="sm"
				onClick={() => setIsOpen((current) => !current)}
				aria-expanded={isOpen}
			>
				Historial de consumo
				{isOpen ? (
					<ChevronUp className="ml-1 h-4 w-4" />
				) : (
					<ChevronDown className="ml-1 h-4 w-4" />
				)}
			</Button>

			{isOpen ? (
				<div className="space-y-3">
					<ManualFeedingHistoryRange
						from={history.from}
						to={history.to}
						onFromChange={history.changeFrom}
						onToChange={history.changeTo}
					/>

					{history.isLoading ? (
						<LoadingState message="Cargando historial..." />
					) : null}
					{history.error ? (
						<ErrorState
							description="No se pudo cargar el historial de consumo."
							onRetry={() => void history.refetch()}
						/>
					) : null}
					{isEmpty ? <EmptyState title="Sin consumos en este periodo" /> : null}

					<div className="space-y-2">
						{history.rows.map((row) => (
							<ManualFeedingHistoryRow
								key={row.id}
								row={row}
								materialName={
									materialNameById.get(row.material_asset_id) ?? "Material"
								}
							/>
						))}
					</div>

					{history.rows.length > 0 || history.page > 1 ? (
						<MaterialPaginationControls
							page={history.page}
							hasNext={history.hasNext}
							onPrevious={history.goToPreviousPage}
							onNext={history.goToNextPage}
						/>
					) : null}
				</div>
			) : null}
		</div>
	);
}
