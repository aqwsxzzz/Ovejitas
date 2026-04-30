import { Link, useLocation } from "@tanstack/react-router";
import { useState } from "react";
import { BarChart3, ClipboardList, Ellipsis, Home, Plus } from "lucide-react";

import { QuickActionsSheet } from "@/features/quick-actions/components/quick-actions-sheet";

const items = [
	{ to: "/v2/dashboard", label: "Inicio", icon: Home, kind: "normal" as const },
	{
		to: "/v2/production-units",
		label: "Ganado",
		icon: ClipboardList,
		kind: "normal" as const,
	},
	{ to: "/v2/log", label: "Registro", icon: Plus, kind: "center" as const },
	{
		to: "/v2/reports",
		label: "Reportes",
		icon: BarChart3,
		kind: "normal" as const,
	},
	{ to: "/v2/more", label: "Mas", icon: Ellipsis, kind: "normal" as const },
];

export function V2BottomNav() {
	const location = useLocation();
	const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);

	return (
		<>
			<nav
				className={`fixed inset-x-0 bottom-0 z-40 px-3 py-2 md:px-6 ${
					isQuickActionsOpen
						? "border-t border-black/30 bg-[#f3ebdc]"
						: "border-t border-black/20 bg-[#f5efe0]/95 backdrop-blur"
				}`}
			>
				<div className="mx-auto flex w-full max-w-4xl items-end justify-between">
					{items.map((item) => {
						const isActive =
							location.pathname === item.to ||
							(item.to === "/v2/dashboard" && location.pathname === "/v2/");
						const Icon = item.icon;

						if (item.kind === "center") {
							return (
								<button
									type="button"
									key={item.to}
									onClick={() => setIsQuickActionsOpen(true)}
									className="-mt-7 flex w-14 flex-col items-center gap-1 text-xs font-semibold text-[#1f211d]"
								>
									<span className="flex h-12 w-12 items-center justify-center rounded-xl border border-black/25 bg-[#f4d94f] shadow-[0_2px_0_rgba(0,0,0,0.35)]">
										<Icon className="h-5 w-5" />
									</span>
									<span>{item.label}</span>
								</button>
							);
						}

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
			<QuickActionsSheet
				open={isQuickActionsOpen}
				onOpenChange={setIsQuickActionsOpen}
				pathname={location.pathname}
			/>
		</>
	);
}
