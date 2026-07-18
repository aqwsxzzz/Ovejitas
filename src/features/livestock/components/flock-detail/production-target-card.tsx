import { useMemo, useState } from "react";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
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
	const [isAddingTarget, setIsAddingTarget] = useState(false);

	// Only offer products that don't already have an active target here.
	const availableCategories = useMemo(() => {
		const taken = new Set(targets.map((target) => target.category_id));
		return categories.filter((category) => !taken.has(category.id));
	}, [categories, targets]);

	// With no targets yet the form is the whole point of the card, so it stays
	// open. Once one exists it collapses behind the button until asked for.
	const isFormOpen = targets.length === 0 || isAddingTarget;
	const canAddTarget = availableCategories.length > 0;

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
				{isFormOpen ? (
					<ProductionTargetForm
						categories={availableCategories}
						disabled={isMutating}
						onAdd={(input) => {
							addTarget(input);
							setIsAddingTarget(false);
						}}
						onCreateCategory={createCategory}
						onCancel={
							isAddingTarget ? () => setIsAddingTarget(false) : undefined
						}
					/>
				) : (
					canAddTarget && (
						<Button
							type="button"
							variant="outline"
							className="w-full"
							disabled={isMutating}
							onClick={() => setIsAddingTarget(true)}
						>
							<Plus aria-hidden="true" className="h-4 w-4" />
							Agregar otra meta
						</Button>
					)
				)}
			</CardContent>
		</Card>
	);
}
