import { Button } from "@/components/ui/button";
import { MaterialConsumptionForm } from "@/features/inventory/components/material-consumption-form";
import { MaterialPurchaseForm } from "@/features/inventory/components/material-purchase-form";
import { MaterialSaleForm } from "@/features/inventory/components/material-sale-form";

import { useFlockMaterialActions } from "./use-flock-material-actions";

interface FlockMaterialInventorySectionProps {
	farmId: string;
	unitId: string;
	assetId: number;
}

export function FlockMaterialInventorySection({
	farmId,
	unitId,
	assetId,
}: FlockMaterialInventorySectionProps) {
	const material = useFlockMaterialActions({ farmId, unitId, assetId });

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
							className="flex items-center justify-between rounded-lg border border-(--v2-border) bg-white px-3 py-2"
						>
							<span className="text-sm font-medium">{row.unit}</span>
							<span className="text-sm font-semibold">
								{row.onHand.toFixed(2)}
							</span>
						</div>
					))}
				</div>
			)}

			<div className="mt-3 grid gap-2 sm:grid-cols-3">
				<Button
					type="button"
					variant="default"
					size="sm"
					onClick={() => material.openMaterialActionPanel("purchase")}
				>
					Agregar (compra)
				</Button>
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={() => material.openMaterialActionPanel("consumption")}
				>
					Reducir (consumo)
				</Button>
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={() => material.openMaterialActionPanel("sale")}
				>
					Reducir (venta)
				</Button>
			</div>

			{material.materialActionMode ? (
				<div className="mt-3 rounded-xl border border-(--v2-border) bg-white p-3">
					<div className="mb-3 flex items-center justify-between gap-3">
						<p className="text-xs font-semibold uppercase tracking-[0.08em] text-(--v2-ink-soft)">
							{material.materialActionTitle}
						</p>
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={material.closeMaterialActionPanel}
						>
							Cerrar
						</Button>
					</div>

					{material.materialActionMode === "purchase" ? (
						<MaterialPurchaseForm
							materialAssetId={assetId}
							isSubmitting={material.isSubmittingPurchase}
							errorMessage={material.materialPurchaseError}
							onSubmit={material.handleSubmitMaterialPurchase}
						/>
					) : null}
					{material.materialActionMode === "consumption" ? (
						<MaterialConsumptionForm
							materialAssetId={assetId}
							consumerAssets={material.consumerAssets}
							isSubmitting={material.isSubmittingConsumption}
							errorMessage={material.materialConsumptionError}
							onSubmit={material.handleSubmitMaterialConsumption}
						/>
					) : null}
					{material.materialActionMode === "sale" ? (
						<MaterialSaleForm
							isSubmitting={material.isSubmittingSale}
							errorMessage={material.materialSaleError}
							onSubmit={material.handleSubmitMaterialSale}
						/>
					) : null}
				</div>
			) : null}
		</div>
	);
}
