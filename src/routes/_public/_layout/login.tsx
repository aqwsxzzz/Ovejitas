import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { LoginForm } from "@/features/auth/components/login-form";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/_public/_layout/login")({
    component: RouteComponent,
});

function RouteComponent() {
    const { t } = useTranslation("login");
    return (
        <Card className="md:w-[600px] w-full">
            <CardContent>
                <LoginForm />
                <Separator className="my-4" />
                <CardFooter className="flex flex-col">
                    <p>{t("footerTitle")}</p>
                    <Link className="" to="/signup">
                        <Button variant="link" className="cursor-pointer">
                            {t("footerLink")}
                        </Button>
                    </Link>
                </CardFooter>
            </CardContent>
        </Card>
    );
}
