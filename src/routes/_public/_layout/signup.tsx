import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SignUpForm } from "@/features/auth/components/sign-up-form";
import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { z } from "zod";

export const Route = createFileRoute("/_public/_layout/signup")({
	// validateSearch: (search: Record<string, unknown>) => {
	// 	return {
	// 		token: search.token ? String(search.token) : undefined,
	// 	};
	// },
	validateSearch: z.object({
		token: z.string().optional(),
	}),
	component: RouteComponent,
});

function RouteComponent() {
	const { t } = useTranslation("signup");
	const search = useSearch({ from: "/_public/_layout/signup" });
	return (
		<Card className="md:w-[600px] w-full">
			<CardContent>
				<SignUpForm token={search.token} />
				<Separator className="my-4" />
				<CardFooter className="flex flex-col">
					<p>{t("footerTitle")}</p>
					<Link
						className=""
						to="/login"
					>
						<Button
							variant="link"
							className="cursor-pointer"
						>
							{t("footerLink")}
						</Button>
					</Link>
				</CardFooter>
			</CardContent>
		</Card>
	);
}
