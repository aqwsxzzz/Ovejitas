import { Link, Outlet, useLocation } from "@tanstack/react-router";

const navItems = [
	{ to: "/v2/dashboard", label: "Dashboard" },
	{ to: "/v2/production-units", label: "Production Units" },
	{ to: "/v2/inventory", label: "Inventory" },
	{ to: "/v2/finance", label: "Finance" },
	{ to: "/v2/alerts", label: "Alerts" },
];

export function V2ShellLayout() {
	const location = useLocation();

	return (
		<div className="v2-theme v2-page">
			<div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 md:px-6">
				<header className="v2-card px-5 py-4 md:px-6 md:py-5">
					<p className="v2-kicker">Ovejitas V2</p>
					<div className="mt-3 flex flex-wrap items-end justify-between gap-4">
						<div>
							<h1 className="text-2xl font-semibold md:text-3xl">
								Farm Profitability Console
							</h1>
							<p className="mt-1 text-sm text-[color:var(--v2-ink-soft)]">
								Action-first workspace focused on autonomy, margin risk, and
								operational decisions.
							</p>
						</div>
						<Link
							to="/v2/settings"
							className="rounded-full border border-[color:var(--v2-border)] bg-white px-4 py-2 text-sm font-medium"
						>
							Keep account settings
						</Link>
					</div>
				</header>

				<nav className="v2-card grid grid-cols-2 gap-2 p-2 md:grid-cols-5">
					{navItems.map((item) => {
						const isActive = location.pathname === item.to;
						return (
							<Link
								key={item.to}
								to={item.to}
								className={`rounded-xl px-3 py-2 text-center text-sm font-medium transition ${
									isActive
										? "bg-[color:var(--v2-primary)] text-white"
										: "bg-white text-[color:var(--v2-ink)] hover:bg-[color:var(--v2-accent)]/20"
								}`}
							>
								{item.label}
							</Link>
						);
					})}
				</nav>

				<main>
					<Outlet />
				</main>
			</div>
		</div>
	);
}
