import { Outlet, createFileRoute } from "@tanstack/react-router";

/**
 * Layout route only.
 *
 * `$unitId` is the parent of `individuals/$individualId`, so it must render an
 * `<Outlet />` — rendering the flock page directly here meant navigating to an
 * individual changed the URL while the flock page stayed on screen. The flock
 * page itself lives in the index child route.
 *
 * `eventType` is validated here so both the flock page and the individual page
 * inherit it.
 */
export const Route = createFileRoute("/v2/production-units/flock/$unitId")({
	validateSearch: (search: Record<string, unknown>) => ({
		eventType:
			typeof search.eventType === "string" ? search.eventType : undefined,
	}),
	component: () => <Outlet />,
});
