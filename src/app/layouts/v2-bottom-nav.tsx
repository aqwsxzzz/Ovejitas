import { Link, useLocation } from "@tanstack/react-router";
import { BarChart3, CalendarDays, ClipboardList, Ellipsis, Home, Settings, Users } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";

const navItems = [
	{ to: "/v2/dashboard", label: "Inicio", icon: Home },
	{ to: "/v2/production-units", label: "Activos", icon: ClipboardList },
	{ to: "/v2/finance", label: "Finanzas", icon: BarChart3 },
] as const;

const moreItems = [
	{ to: "/v2/more/acceso", label: "Acceso", icon: Users },
	{ to: "/v2/more/event-categories", label: "Categorias de eventos", icon: CalendarDays },
	{ to: "/v2/settings", label: "Configuracion", icon: Settings },
] as const;

export function V2BottomNav() {
	const location = useLocation();
	const [open, setOpen] = useState(false);

	return (
		<>
			<nav className="fixed inset-x-0 bottom-0 z-40 border-t border-black/20 bg-(--v2-cream)/95 px-3 py-2 backdrop-blur md:px-6">
				<div className="mx-auto flex w-full max-w-4xl items-end justify-between">
					{navItems.map((item) => {
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
									isActive ? "font-semibold text-(--v2-charcoal)" : "text-(--v2-stone)"
								}`}
							>
								<span
									className={`flex h-7 w-7 items-center justify-center rounded-md border ${
										isActive
											? "border-(--v2-charcoal) bg-(--v2-charcoal) text-(--v2-cream)"
											: "border-black/25 bg-(--v2-cream)"
									}`}
								>
									<Icon className="h-4 w-4" />
								</span>
								<span>{item.label}</span>
							</Link>
						);
					})}

					<Button
						variant="ghost"
						onClick={() => setOpen(true)}
						className={`flex h-auto w-14 flex-col items-center gap-1 p-0 text-xs hover:bg-transparent ${
							open ? "font-semibold text-(--v2-charcoal)" : "text-(--v2-stone)"
						}`}
					>
						<span
							className={`flex h-7 w-7 items-center justify-center rounded-md border ${
								open
									? "border-(--v2-charcoal) bg-(--v2-charcoal) text-(--v2-cream)"
									: "border-black/25 bg-(--v2-cream)"
							}`}
						>
							<Ellipsis className="h-4 w-4" />
						</span>
						<span>Mas</span>
					</Button>
				</div>
			</nav>

			<Sheet open={open} onOpenChange={setOpen}>
				<SheetContent
					side="bottom"
					className="rounded-t-2xl bg-(--v2-cream) pb-8"
				>
					<SheetHeader className="pb-2">
						<SheetTitle className="text-left text-base font-semibold text-(--v2-charcoal)">
							Mas opciones
						</SheetTitle>
					</SheetHeader>
					<div className="flex flex-col gap-1 px-4">
						{moreItems.map((item) => {
							const Icon = item.icon;
							return (
								<SheetClose asChild key={item.to}>
									<Link
										to={item.to}
										className="flex items-center gap-3 rounded-xl px-3 py-3 transition hover:bg-black/5"
									>
										<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-(--v2-mint-100) text-(--v2-emerald-600)">
											<Icon className="h-4 w-4" />
										</div>
										<span className="text-sm font-medium text-(--v2-charcoal)">
											{item.label}
										</span>
									</Link>
								</SheetClose>
							);
						})}
					</div>
				</SheetContent>
			</Sheet>
		</>
	);
}
