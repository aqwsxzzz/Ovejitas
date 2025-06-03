import { Card, CardContent } from "@/components/ui/card";
import LoginForm from "@/features/auth/components/login";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_public/_layout/login")({
    component: RouteComponent,
});

function RouteComponent() {
    return (
        <Card className="md:w-[600px] w-full">
            <CardContent>
                <LoginForm />
            </CardContent>
        </Card>
    );
}
