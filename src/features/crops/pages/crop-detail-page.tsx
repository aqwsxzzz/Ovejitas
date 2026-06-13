import { Link } from "@tanstack/react-router";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CropHarvestForm } from "@/features/crops/components/crop-harvest-form";
import { CropExpenseForm } from "@/features/crops/components/crop-expense-form";
import { CropTimelinePanel } from "@/features/crops/components/crop-timeline-panel";
import { CropDetailHeader } from "@/features/crops/components/crop-detail-header";
import { CropProductionSnapshot } from "@/features/crops/components/crop-production-snapshot";
import { CropFinancialSnapshot } from "@/features/crops/components/crop-financial-snapshot";
import { useCropData } from "@/features/crops/hooks/use-crop-data";
import { useCropActions } from "@/features/crops/hooks/use-crop-actions";

interface CropDetailPageProps {
	cropId: string;
}

export function CropDetailPage({ cropId }: CropDetailPageProps) {
	const data = useCropData(cropId);
	const actions = useCropActions(data.farmId, cropId);

	if (!data.farmId) {
		return (
			<p className="text-sm text-(--v2-ink-soft)">
				Selecciona una granja para cargar los detalles del cultivo.
			</p>
		);
	}
	if (!data.hasValidAssetId) {
		return <p className="text-sm text-destructive">ID de cultivo no válido.</p>;
	}
	if (data.isLoadingAsset) {
		return <p className="text-sm text-(--v2-ink-soft)">Cargando cultivo...</p>;
	}
	if (!data.asset || data.asset.kind !== "crop") {
		return (
			<div className="space-y-2">
				<p className="text-sm text-destructive">Cultivo no encontrado.</p>
				<Link
					to="/v2/production-units/$assetKind"
					params={{ assetKind: "crop" }}
					className="text-sm underline"
				>
					Volver a cultivos
				</Link>
			</div>
		);
	}

	return (
		<section className="space-y-4">
			<CropDetailHeader
				asset={data.asset}
				produceName={data.produceName}
			/>

			<div className="grid gap-4 lg:grid-cols-2">
				<CropProductionSnapshot
					rows={data.productionRows}
					isLoading={data.productionAggregateQuery.isLoading}
					isError={!!data.productionAggregateQuery.error}
				/>
				<CropFinancialSnapshot
					totals={data.profitabilityTotals}
					isLoading={data.profitabilityQuery.isLoading}
					isError={!!data.profitabilityQuery.error}
				/>
			</div>

			<div className="grid gap-4 lg:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle>Registrar cosecha</CardTitle>
					</CardHeader>
					<CardContent>
						<CropHarvestForm
							isSubmitting={actions.isSubmittingHarvest}
							errorMessage={actions.harvestError}
							disabled={data.asset.produce_asset_id === null}
							disabledReason="Vincula un material de produce al cultivo para registrar cosechas."
							onSubmit={actions.handleHarvestSubmit}
						/>
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle>Registrar gasto</CardTitle>
					</CardHeader>
					<CardContent>
						<CropExpenseForm
							categories={data.categories.map((cat) => ({
								id: cat.id,
								name: cat.name,
							}))}
							isSubmitting={actions.isSubmittingExpense}
							errorMessage={actions.expenseError}
							onSubmit={actions.handleExpenseSubmit}
						/>
					</CardContent>
				</Card>
			</div>

			<CropTimelinePanel
				farmId={data.farmId}
				cropId={cropId}
			/>

			<Separator />
			<Link
				to="/v2/production-units/$assetKind"
				params={{ assetKind: "crop" }}
				className="text-sm underline"
			>
				Volver a cultivos
			</Link>
		</section>
	);
}
