import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import LoginForm from "@/features/auth/components/login-form/login-form";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_public/_layout/login")({
    component: RouteComponent,
});

function RouteComponent() {
    return (
        <Card className="md:w-[600px] w-full">
            <CardContent>
                <LoginForm />
                <Separator className="my-4" />
                <CardFooter className="flex flex-col">
                    <p>Don't have an account ?</p>
                    <Link className="" to="/signup">
                        <Button variant="link">Sign up here</Button>
                    </Link>
                </CardFooter>
            </CardContent>
        </Card>
    );
}
