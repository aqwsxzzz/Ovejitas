import { Link, useLocation } from "@tanstack/react-router";
import { BarChart3, ClipboardList, Ellipsis, Home } from "lucide-react";

const items = [
	{ to: "/v2/dashboard", label: "Inicio", icon: Home, kind: "normal" as const },
	{
		to: "/v2/production-units",
		label: "Activos",
		icon: ClipboardList,
		kind: "normal" as const,
	},
	{
		to: "/v2/finance",
		label: "Finanzas",
		icon: BarChart3,
		kind: "normal" as const,
	},
	{ to: "/v2/more", label: "Mas", icon: Ellipsis, kind: "normal" as const },
];

export function V2BottomNav() {
	const location = useLocation();

	return (
		<nav className="fixed inset-x-0 bottom-0 z-40 border-t border-black/20 bg-[#f5efe0]/95 px-3 py-2 backdrop-blur md:px-6">
			<div className="mx-auto flex w-full max-w-4xl items-end justify-between">
				{items.map((item) => {
					const isActive =
						location.pathname === item.to ||
						(item.to === "/v2/production-units" &&
							location.pathname.startsWith("/v2/production-units")) ||
						(item.to === "/v2/dashboard" && location.pathname === "/v2/");
					const Icon = item.icon;

					return (
						<Link
							key={item.to}
							to={item.to}
							className={`flex w-14 flex-col items-center gap-1 text-xs ${
								isActive ? "font-semibold text-[#1f211d]" : "text-[#67695f]"
							}`}
						>
							<span
								className={`flex h-7 w-7 items-center justify-center rounded-md border ${
									isActive
										? "border-[#1f211d] bg-[#1f211d] text-[#f5efe0]"
										: "border-black/25 bg-[#f5efe0]"
								}`}
							>
								<Icon className="h-4 w-4" />
							</span>
							<span>{item.label}</span>
						</Link>
					);
				})}
			</div>
		</nav>
	);
}
