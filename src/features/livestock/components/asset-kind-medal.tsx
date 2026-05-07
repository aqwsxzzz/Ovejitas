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
		className: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
	},
	crop: {
		icon: Sprout,
		label: "Cultivo",
		className: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
	},
	equipment: {
		icon: Wrench,
		label: "Equipo",
		className: "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
	},
	material: {
		icon: Package,
		label: "Material",
		className: "bg-orange-50 text-orange-700 ring-1 ring-orange-200",
	},
	location: {
		icon: MapPin,
		label: "Ubicacion",
		className: "bg-sky-50 text-sky-700 ring-1 ring-sky-200",
	},
};

export function AssetKindMedal({ kind }: AssetKindMedalProps) {
	const { icon: Icon, label, className } = KIND_MEDAL_CONFIG[kind];

	return (
		<div
			className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${className}`}
			aria-label={label}
			title={label}
		>
			<Icon className="h-5 w-5" />
		</div>
	);
}
