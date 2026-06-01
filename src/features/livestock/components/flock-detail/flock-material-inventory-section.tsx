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
							? "bg-red-100 text-red-700"
							: material.inventoryStatus === "low"
								? "bg-amber-100 text-amber-700"
								: "bg-emerald-100 text-emerald-700"
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
				<button
					type="button"
					onClick={() => material.openMaterialActionPanel("purchase")}
					className="rounded-full bg-(--v2-ink) px-3 py-1.5 text-xs font-semibold text-white"
				>
					Agregar (compra)
				</button>
				<button
					type="button"
					onClick={() => material.openMaterialActionPanel("consumption")}
					className="rounded-full border border-(--v2-border) bg-white px-3 py-1.5 text-xs font-semibold"
				>
					Reducir (consumo)
				</button>
				<button
					type="button"
					onClick={() => material.openMaterialActionPanel("sale")}
					className="rounded-full border border-(--v2-border) bg-white px-3 py-1.5 text-xs font-semibold"
				>
					Reducir (venta)
				</button>
			</div>

			{material.materialActionMode ? (
				<div className="mt-3 rounded-xl border border-(--v2-border) bg-white p-3">
					<div className="mb-3 flex items-center justify-between gap-3">
						<p className="text-xs font-semibold uppercase tracking-[0.08em] text-(--v2-ink-soft)">
							{material.materialActionTitle}
						</p>
						<button
							type="button"
							onClick={material.closeMaterialActionPanel}
							className="rounded-full border border-(--v2-border) px-2.5 py-1 text-xs font-semibold"
						>
							Cerrar
						</button>
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
