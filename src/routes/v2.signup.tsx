import { V2SignupPage } from "@/features/auth/pages/v2-signup-page";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/v2/signup")({
	component: V2SignupPage,
});
