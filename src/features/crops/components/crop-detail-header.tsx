import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { ILivestockAsset } from "@/features/livestock/types/livestock-types";
import { toModeLabel } from "@/features/livestock/components/flock-detail/flock-detail-utils";

interface CropDetailHeaderProps {
	asset: ILivestockAsset;
	produceName: string | null;
}

export function CropDetailHeader({ asset, produceName }: CropDetailHeaderProps) {
	const hasDescription = Boolean(asset.description?.trim());

	return (
		<div className="v2-card p-5">
			<div className="min-w-0 flex-1">
				<div className="mb-2 flex items-center justify-between gap-3">
					<Link
						to="/v2/production-units/$assetKind"
						params={{ assetKind: "crop" }}
						className="inline-flex items-center justify-center p-1 text-(--v2-ink-soft) transition-colors hover:text-(--v2-ink)"
						aria-label="Volver a cultivos"
					>
						<ArrowLeft aria-hidden="true" className="h-6 w-6" />
					</Link>
					<div className="flex items-center gap-2">
						<Badge variant="kind">Cultivo</Badge>
						{toModeLabel(asset) ? (
							<Badge variant="mode">{toModeLabel(asset)}</Badge>
						) : null}
					</div>
				</div>
				<div className="flex items-center gap-2">
					<h1
						className="text-3xl font-bold leading-tight md:text-[2.35rem]"
						style={{ color: "#006847", fontFamily: "var(--v2-font-display)" }}
					>
						{asset.name}
					</h1>
				</div>
				<div className="mt-3 inline-flex max-w-full items-center gap-2 rounded-xl border border-(--v2-border) bg-(--v2-sage-50) px-3 py-1.5 text-sm text-(--v2-ink)">
					<span className="inline-flex h-5 w-5 items-center justify-center text-(--v2-emerald-700)">
						<svg
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
							className="h-4 w-4"
						>
							<path d="M12 21s-6-5.5-6-11a6 6 0 1 1 12 0c0 5.5-6 11-6 11Z" />
							<circle cx="12" cy="10" r="2" />
						</svg>
					</span>
					<span className="truncate">{asset.location ?? "Sin ubicacion"}</span>
				</div>
				{produceName !== null ? (
					<p className="mt-2 text-sm text-(--v2-ink-soft)">
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
					<p className="mt-2 text-sm text-(--v2-ink-soft)">
						Sin material de produce vinculado — las cosechas requieren uno.
					</p>
				)}
				{hasDescription ? (
					<>
						<div className="mt-4 border-t border-(--v2-border)" />
						<div className="mt-4 flex justify-center">
							<blockquote
								className="max-w-2xl text-center text-lg italic leading-snug text-(--v2-primary) md:text-xl"
								style={{
									fontFamily:
										'"Segoe Script", "Bradley Hand", "Comic Sans MS", cursive',
								}}
							>
								&quot;{asset.description?.trim()}&quot;
							</blockquote>
						</div>
					</>
				) : null}
			</div>
		</div>
	);
}
