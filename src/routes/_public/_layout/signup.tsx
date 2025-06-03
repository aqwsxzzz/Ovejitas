import { Card, CardContent } from "@/components/ui/card";
import SignUpForm from "@/features/auth/components/sign-up-form";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_public/_layout/signup")({
    component: RouteComponent,
});

function RouteComponent() {
    return (
        <Card className="md:w-[600px] w-full">
            <CardContent>
                <SignUpForm />
            </CardContent>
        </Card>
    );
}
