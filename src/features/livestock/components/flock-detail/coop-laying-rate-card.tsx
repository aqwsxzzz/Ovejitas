import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUpdateLivestockAssetById } from "@/features/livestock/api/livestock-queries";
import type { ILivestockAsset } from "@/features/livestock/types/livestock-types";

interface CoopLayingRateCardProps {
	farmId: string;
	asset: ILivestockAsset;
}

export function CoopLayingRateCard({ farmId, asset }: CoopLayingRateCardProps) {
	const [rate, setRate] = useState(asset.expected_eggs_per_head_per_day ?? "");
	const [error, setError] = useState<string | null>(null);
	const updateAssetMutation = useUpdateLivestockAssetById();

	const handleSave = async () => {
		const trimmed = rate.trim();
		const parsed = Number(trimmed);
		if (trimmed !== "" && (!Number.isFinite(parsed) || parsed < 0)) {
			setError("Ingresa una tasa válida (huevos por ave por día).");
			return;
		}

		setError(null);
		await updateAssetMutation.mutateAsync({
			farmId,
			assetId: asset.id,
			data: { expected_eggs_per_head_per_day: trimmed === "" ? null : parsed },
		});
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-base">Postura esperada</CardTitle>
			</CardHeader>
			<CardContent className="space-y-2">
				<Label htmlFor="coop-laying-rate">Huevos por ave por día</Label>
				<div className="flex items-center gap-2">
					<Input
						id="coop-laying-rate"
						type="number"
						min="0"
						step="0.01"
						value={rate}
						placeholder="0.7"
						onChange={(event) => setRate(event.target.value)}
					/>
					<Button
						type="button"
						onClick={() => void handleSave()}
						disabled={updateAssetMutation.isPending}
					>
						{updateAssetMutation.isPending ? "Guardando..." : "Guardar"}
					</Button>
				</div>
				<p className="text-xs text-(--v2-ink-soft)">
					Define la productividad esperada para el reporte de productividad de
					gallineros.
				</p>
				{error ? <p className="text-sm text-destructive">{error}</p> : null}
			</CardContent>
		</Card>
	);
}
