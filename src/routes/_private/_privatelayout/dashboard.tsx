import { Button } from "@/components/ui/button";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_private/_privatelayout/dashboard")({
    component: RouteComponent,
});

function RouteComponent() {
    return (
        <div>
            <Button>Create</Button>
        </div>
    );
}
