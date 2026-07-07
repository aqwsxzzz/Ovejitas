import { useMemo } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { ProductionTargetForm } from "./production-target-form";
import { ProductionTargetRow } from "./production-target-row";
import { useAssetProductionTargets } from "./use-asset-production-targets";

interface ProductionTargetCardProps {
	farmId: string;
	assetId: number;
}

export function ProductionTargetCard({
	farmId,
	assetId,
}: ProductionTargetCardProps) {
	const {
		targets,
		categories,
		categoryNameById,
		addTarget,
		adjustRate,
		archiveTarget,
		createCategory,
		isMutating,
	} = useAssetProductionTargets(farmId, assetId);

	// Only offer products that don't already have an active target here.
	const availableCategories = useMemo(() => {
		const taken = new Set(targets.map((target) => target.category_id));
		return categories.filter((category) => !taken.has(category.id));
	}, [categories, targets]);

	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-base">Metas de producción</CardTitle>
			</CardHeader>
			<CardContent className="space-y-3">
				{targets.length > 0 ? (
					<div>
						{targets.map((target) => (
							<ProductionTargetRow
								key={target.id}
								target={target}
								productName={
									categoryNameById.get(target.category_id) ??
									`Categoría #${target.category_id}`
								}
								disabled={isMutating}
								onAdjustRate={adjustRate}
								onArchive={archiveTarget}
							/>
						))}
					</div>
				) : (
					<p className="text-xs text-(--v2-ink-soft)">
						Define la producción esperada para calcular la productividad de este
						lote.
					</p>
				)}
				<ProductionTargetForm
					categories={availableCategories}
					disabled={isMutating}
					onAdd={addTarget}
					onCreateCategory={createCategory}
				/>
			</CardContent>
		</Card>
	);
}
