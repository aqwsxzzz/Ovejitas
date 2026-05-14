import { V2LandingPage } from "@/features/auth/pages/v2-landing-page";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
	component: V2LandingPage,
});
