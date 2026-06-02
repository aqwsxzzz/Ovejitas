import { Link } from "@tanstack/react-router";
import { Sprout } from "lucide-react";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import type { ILivestockAsset } from "@/features/livestock/types/livestock-types";

interface CropDetailHeaderProps {
	asset: ILivestockAsset;
	produceName: string | null;
}

export function CropDetailHeader({ asset, produceName }: CropDetailHeaderProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2 text-2xl">
					<Sprout className="h-6 w-6" />
					{asset.name}
				</CardTitle>
				<p className="text-sm text-(--v2-ink-soft)">
					{asset.location ?? "Sin ubicacion"} · {asset.mode} mode
				</p>
				{produceName !== null ? (
					<p className="text-sm text-(--v2-ink-soft)">
						Produce vinculado:{" "}
						<Link
							to="/v2/inventory/materials/$materialId"
							params={{ materialId: String(asset.produce_asset_id) }}
							className="underline"
						>
							{produceName}
						</Link>
					</p>
				) : (
					<p className="text-sm text-(--v2-ink-soft)">
						Sin material de produce vinculado — las cosechas requieren uno.
					</p>
				)}
				{asset.description ? (
					<p className="text-sm">{asset.description}</p>
				) : null}
			</CardHeader>
		</Card>
	);
}
