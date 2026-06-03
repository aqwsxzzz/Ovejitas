import { Link, createFileRoute } from "@tanstack/react-router";
import {
	Bell,
	CalendarDays,
	ChevronRight,
	Package,
	Settings,
	Tractor,
	Users,
	Wallet,
	type LucideIcon,
} from "lucide-react";
interface MoreSectionItem {
	to: string;
	title: string;
	description: string;
	icon: LucideIcon;
	badge?: string;
}

const extraViews: MoreSectionItem[] = [
	{
		to: "/v2/more/acceso",
		title: "Acceso",
		description: "Miembros e invitaciones a la granja",
		icon: Users,
	},
	{
		to: "/v2/more/event-categories",
		title: "Categorias de eventos",
		description: "Configura hitos de produccion",
		icon: CalendarDays,
	},
	{
		to: "/v2/production-units",
		title: "Ganado / Unidades",
		description: "Inventario y trazabilidad animal",
		icon: Tractor,
	},
	{
		to: "/v2/finance",
		title: "Finanzas",
		description: "Costos operativos y margenes",
		icon: Wallet,
	},
	{
		to: "/v2/inventory",
		title: "Alimento e Inventario",
		description: "Stock de insumos y raciones",
		icon: Package,
	},
	{
		to: "/v2/alerts",
		title: "Alertas",
		description: "Centro de notificaciones criticas",
		icon: Bell,
		badge: "3",
	},
	{
		to: "/v2/settings",
		title: "Configuracion",
		description: "Preferencias de cuenta y sistema",
		icon: Settings,
	},
];

export const Route = createFileRoute("/v2/more/")({
	component: MorePage,
});

function MorePage() {
	return (
		<section className="space-y-4">
			<div className="v2-card p-5 md:p-6">
				<p className="v2-kicker">Tu cuenta</p>
				<h2 className="mt-2 text-xl font-semibold">Mas</h2>
				<p className="mt-1 text-sm text-(--v2-ink-soft)">
					Gestion central de configuracion y modulos.
				</p>
			</div>
			<div className="space-y-3">
				{extraViews.map((view) => (
					<Link
						key={view.to}
						to={view.to}
						className="group block rounded-3xl border border-black/5 bg-[#f8f8f7] px-4 py-4 shadow-xs transition hover:-translate-y-px hover:shadow-sm"
					>
						<div className="flex items-center gap-3">
							<div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#dff1e8] text-[#2f6f5a]">
								<view.icon className="h-5 w-5" />
							</div>
							<div className="min-w-0 flex-1">
								<p className="truncate text-[22px] leading-6 font-medium text-(--v2-ink)">
									{view.title}
								</p>
								<p className="mt-1 text-sm text-(--v2-ink-soft)">
									{view.description}
								</p>
							</div>
							<div className="ml-1 flex items-center gap-2">
								{view.badge ? (
									<span className="rounded-full bg-[#b91c1c] px-1.5 py-0.5 text-[10px] leading-none font-semibold text-white">
										{view.badge}
									</span>
								) : null}
								<ChevronRight className="h-4 w-4 text-black/25 transition group-hover:translate-x-0.5" />
							</div>
						</div>
					</Link>
				))}
			</div>
		</section>
	);
}
