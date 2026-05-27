import { Link } from "@tanstack/react-router";

import { useGetUserProfile } from "@/features/auth/api/auth-queries";
import { ASSET_KIND_OPTIONS } from "@/features/livestock/constants/asset-kind-options";
import { AssetKindMedal } from "@/features/livestock/components/asset-kind-medal";

export function LivestockPage() {
	const { data: currentUser } = useGetUserProfile();
	const farmId = currentUser?.lastVisitedFarmId ?? "";

	if (!farmId) {
		return (
			<section className="space-y-4">
				<div className="v2-card p-5">
					<h1 className="text-2xl font-semibold">Activos</h1>
					<p className="mt-1 text-sm text-[color:var(--v2-ink-soft)]">
						Selecciona una granja para cargar datos reales.
					</p>
				</div>
			</section>
		);
	}

	return (
		<section className="space-y-4">
			<div className="v2-card p-5">
				<h1 className="text-2xl font-semibold">Activos</h1>
				<p className="mt-1 text-sm text-[color:var(--v2-ink-soft)]">
					Elige el tipo de activo que quieres administrar.
				</p>
			</div>

			<div className="space-y-2">
				{ASSET_KIND_OPTIONS.map((option) => (
					<Link
						key={option.kind}
						to="/v2/production-units/$assetKind"
						params={{ assetKind: option.kind }}
						className="v2-card flex w-full items-center justify-between p-4 text-left transition hover:-translate-y-px"
					>
						<div className="flex items-center gap-3">
							<AssetKindMedal kind={option.kind} />
							<div>
								<p className="text-base font-semibold">{option.title}</p>
								<p className="text-sm text-[color:var(--v2-ink-soft)]">
									Ver y gestionar {option.pluralLabel}
								</p>
							</div>
						</div>
						<span
							className="text-xl leading-none text-[color:var(--v2-ink-soft)]"
							aria-hidden="true"
						>
							›
						</span>
					</Link>
				))}
			</div>
		</section>
	);
}
