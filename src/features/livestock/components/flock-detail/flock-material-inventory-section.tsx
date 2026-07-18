import { MaterialMovementDialog } from "@/features/inventory/components/material-movement-dialog";

import { useFlockMaterialActions } from "./use-flock-material-actions";

interface FlockMaterialInventorySectionProps {
	farmId: string;
	assetId: number;
}

export function FlockMaterialInventorySection({
	farmId,
	assetId,
}: FlockMaterialInventorySectionProps) {
	const material = useFlockMaterialActions({ farmId, assetId });

	return (
		<div className="v2-card p-4">
			<div className="mb-3 flex items-center justify-between gap-3">
				<div>
					<p className="v2-kicker">Inventario actual</p>
					<p className="text-sm text-(--v2-ink-soft)">
						{material.inventoryRows.length === 0
							? "No hay movimientos registrados"
							: `${material.inventoryRows.length} unidad(es) de medida activas`}
					</p>
				</div>
				<span
					className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
						material.inventoryStatus === "critical"
							? "bg-destructive/15 text-destructive"
							: material.inventoryStatus === "low"
								? "bg-warning/15 text-warning"
								: "bg-success/15 text-success"
					}`}
				>
					{material.inventoryStatus === "critical"
						? "Critico"
						: material.inventoryStatus === "low"
							? "Bajo"
							: "OK"}
				</span>
			</div>

			{material.inventoryRows.length === 0 ? (
				<p className="text-sm text-(--v2-ink-soft)">
					Registra un primer movimiento de inventario para activar stock.
				</p>
			) : (
				<div className="space-y-2">
					{material.inventoryRows.map((row) => (
						<div
							key={`${row.asset_id}-${row.unit}`}
							className="flex items-center justify-between rounded-lg border border-(--v2-border) bg-(--v2-surface) px-3 py-2"
						>
							<span className="text-sm font-medium">{row.unit}</span>
							<span className="text-sm font-semibold">
								{row.onHand.toFixed(2)}
							</span>
						</div>
					))}
				</div>
			)}

			<div className="mt-3 flex justify-center">
				<MaterialMovementDialog
					farmId={farmId}
					materialAssetId={assetId}
					consumerAssets={material.consumerAssets}
					categoryOptions={material.categoryOptions}
				/>
			</div>
		</div>
	);
}
