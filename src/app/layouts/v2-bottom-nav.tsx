import { Link, useLocation } from "@tanstack/react-router";
import { BarChart3, ClipboardList, Ellipsis, Home } from "lucide-react";

const navItems = [
	{ to: "/v2/dashboard", label: "Inicio", icon: Home },
	{ to: "/v2/production-units", label: "Activos", icon: ClipboardList },
	{ to: "/v2/finance", label: "Finanzas", icon: BarChart3 },
	{ to: "/v2/more", label: "Mas", icon: Ellipsis },
] as const;

/**
 * "Mas" owns everything outside the three primary tabs, so its contents live on
 * a real page (`/v2/more`) rather than in a bottom sheet: the page has room for
 * descriptions, grouping and per-item state, and it is a single list to
 * maintain. A sheet duplicating a subset of it is what previously left several
 * routes unreachable.
 */
function isNavItemActive(pathname: string, to: string): boolean {
	if (pathname === to) return true;
	// Section tabs stay lit on their nested routes.
	if (to === "/v2/production-units" || to === "/v2/more") {
		return pathname.startsWith(`${to}/`);
	}
	if (to === "/v2/dashboard") return pathname === "/v2/";
	return false;
}

function NavItemBody({
	icon: Icon,
	label,
	isActive,
}: {
	icon: typeof Home;
	label: string;
	isActive: boolean;
}) {
	return (
		<>
			<span
				className={`flex h-7 w-7 items-center justify-center rounded-md border ${
					isActive
						? "border-(--v2-charcoal) bg-(--v2-charcoal) text-(--v2-cream)"
						: "border-(--v2-border) bg-(--v2-cream)"
				}`}
			>
				<Icon className="h-4 w-4" />
			</span>
			<span>{label}</span>
		</>
	);
}

export function V2BottomNav() {
	const location = useLocation();

	return (
		<nav className="fixed inset-x-0 bottom-0 z-40 border-t border-(--v2-border) bg-(--v2-cream)/95 px-3 py-2 backdrop-blur md:px-6">
			<div className="mx-auto flex w-full max-w-4xl items-end justify-between">
				{navItems.map((item) => {
					const isActive = isNavItemActive(location.pathname, item.to);
					const Icon = item.icon;

					return (
						<Link
							key={item.to}
							to={item.to}
							className={`flex w-14 flex-col items-center gap-1 text-xs ${
								isActive
									? "font-semibold text-(--v2-charcoal)"
									: "text-(--v2-stone)"
							}`}
						>
							<NavItemBody
								icon={Icon}
								label={item.label}
								isActive={isActive}
							/>
						</Link>
					);
				})}
			</div>
		</nav>
	);
}
