import type { LucideIcon } from "lucide-react";
import { Egg, MapPin, Package, PawPrint, Sprout, Wrench } from "lucide-react";

import { ASSET_KIND_LABELS } from "@/features/livestock/constants/asset-kind-options";
import type { LivestockAssetKind } from "@/features/livestock/types/livestock-types";

interface AssetKindMedalProps {
	kind: LivestockAssetKind;
}

const KIND_MEDAL_CONFIG: Record<
	LivestockAssetKind,
	{
		icon: LucideIcon;
		className: string;
	}
> = {
	animal: {
		icon: PawPrint,
		className: "bg-warning/10 text-warning ring-1 ring-warning/30",
	},
	crop: {
		icon: Sprout,
		className: "bg-success/10 text-success ring-1 ring-success/30",
	},
	equipment: {
		icon: Wrench,
		className: "bg-muted text-foreground ring-1 ring-border",
	},
	material: {
		icon: Package,
		className: "bg-warning/10 text-warning ring-1 ring-warning/30",
	},
	produce: {
		icon: Egg,
		className: "bg-success/10 text-success ring-1 ring-success/30",
	},
	location: {
		icon: MapPin,
		className: "bg-info/10 text-info ring-1 ring-info/30",
	},
};

export function AssetKindMedal({ kind }: AssetKindMedalProps) {
	const { icon: Icon, className } = KIND_MEDAL_CONFIG[kind];
	const label = ASSET_KIND_LABELS[kind];

	return (
		<div
			className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${className}`}
			aria-label={label}
			title={label}
		>
			<Icon className="h-4 w-4" />
		</div>
	);
}
