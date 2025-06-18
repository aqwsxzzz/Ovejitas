import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SignUpForm } from "@/features/auth/components/create-account-form/sign-up-form";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/_public/_layout/signup")({
    component: RouteComponent,
});

function RouteComponent() {
    const { t } = useTranslation("signup");
    return (
        <Card className="md:w-[600px] w-full">
            <CardContent>
                <SignUpForm />
                <Separator className="my-4" />
                <CardFooter className="flex flex-col">
                    <p>{t("footerTitle")}</p>
                    <Link className="" to="/login">
                        <Button variant="link" className="cursor-pointer">
                            {t("footerLink")}
                        </Button>
                    </Link>
                </CardFooter>
            </CardContent>
        </Card>
    );
}
