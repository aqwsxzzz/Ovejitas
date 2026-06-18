import type { LucideIcon } from "lucide-react";
import { MapPin, Package, PawPrint, Sprout, Wrench } from "lucide-react";

import type { LivestockAssetKind } from "@/features/livestock/types/livestock-types";

interface AssetKindMedalProps {
	kind: LivestockAssetKind;
}

const KIND_MEDAL_CONFIG: Record<
	LivestockAssetKind,
	{
		icon: LucideIcon;
		label: string;
		className: string;
	}
> = {
	animal: {
		icon: PawPrint,
		label: "Animal",
		className: "bg-warning/10 text-warning ring-1 ring-warning/30",
	},
	crop: {
		icon: Sprout,
		label: "Cultivo",
		className: "bg-success/10 text-success ring-1 ring-success/30",
	},
	equipment: {
		icon: Wrench,
		label: "Equipo",
		className: "bg-muted text-foreground ring-1 ring-border",
	},
	material: {
		icon: Package,
		label: "Material",
		className: "bg-warning/10 text-warning ring-1 ring-warning/30",
	},
	location: {
		icon: MapPin,
		label: "Ubicacion",
		className: "bg-info/10 text-info ring-1 ring-info/30",
	},
};

export function AssetKindMedal({ kind }: AssetKindMedalProps) {
	const { icon: Icon, label, className } = KIND_MEDAL_CONFIG[kind];

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
