import { V2ShellLayout } from "@/app/layouts/v2-shell-layout";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/v2")({
	component: V2ShellLayout,
});
