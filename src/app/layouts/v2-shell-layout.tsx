import { V2BottomNav } from "@/app/layouts/v2-bottom-nav";
import { Outlet, useLocation } from "@tanstack/react-router";

export function V2ShellLayout() {
	const location = useLocation();
	const isAuthRoute =
		location.pathname === "/v2/login" || location.pathname === "/v2/signup";

	if (isAuthRoute) {
		return <Outlet />;
	}

	return (
		<div className="v2-theme v2-page">
			<div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 md:px-6">
				<main className="pb-24 md:pb-28">
					<Outlet />
				</main>
			</div>
			<V2BottomNav />
		</div>
	);
}
