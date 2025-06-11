import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_private/_layout")({
    component: RouteComponent,
});

function RouteComponent() {
    return (
        <div className="bg-destructive h-screen w-screen">
            <div>Hello "/_private/_layout"!</div>
            <Outlet />
        </div>
    );
}
