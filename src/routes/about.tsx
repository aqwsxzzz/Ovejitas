import { Button } from "@/components/ui/button";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
    component: About,
});

function About() {
    return (
        <div className="p-2 bg-red-500">
            Hello from About!
            <Button variant={"destructive"}>Apretame</Button>
        </div>
    );
}
