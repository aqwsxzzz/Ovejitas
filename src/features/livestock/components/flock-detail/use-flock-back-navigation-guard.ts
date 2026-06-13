import { useEffect } from "react";

export function useFlockBackNavigationGuard() {
	useEffect(() => {
		if (typeof window === "undefined") return;

		window.history.pushState(
			{ flockDetailGuard: true },
			"",
			window.location.href,
		);
		const handlePopState = () => {
			window.history.pushState(
				{ flockDetailGuard: true },
				"",
				window.location.href,
			);
		};

		window.addEventListener("popstate", handlePopState);
		return () => window.removeEventListener("popstate", handlePopState);
	}, []);
}
