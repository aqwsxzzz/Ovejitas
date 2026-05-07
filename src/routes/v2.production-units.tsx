import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/v2/production-units")({
	component: ProductionUnitsLayout,
});

function ProductionUnitsLayout() {
	return <Outlet />;
}
