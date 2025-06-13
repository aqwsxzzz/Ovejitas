import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import SignUpForm from "@/features/auth/components/create-account-form/sign-up-form";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_public/_layout/signup")({
    component: RouteComponent,
});

function RouteComponent() {
    return (
        <Card className="md:w-[600px] w-full">
            <CardContent>
                <SignUpForm />
                <Separator className="my-4" />
                <CardFooter className="flex flex-col">
                    <p>Already have an account ?</p>
                    <Link className="" to="/login">
                        <Button variant="link">Log in here</Button>
                    </Link>
                </CardFooter>
            </CardContent>
        </Card>
    );
}
