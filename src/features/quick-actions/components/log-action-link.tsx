import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";

interface LogActionLinkProps {
	actionId: string;
	label: string;
	sourcePath: string;
	contextLabel?: string;
	variant?: React.ComponentProps<typeof Button>["variant"];
	size?: React.ComponentProps<typeof Button>["size"];
	children?: ReactNode;
}

/**
 * Contextual entry point into the quick-log dispatcher. Renders an in-view
 * button that opens `/v2/log` for a single, working action — no global menu.
 */
export function LogActionLink({
	actionId,
	label,
	sourcePath,
	contextLabel,
	variant = "default",
	size = "sm",
	children,
}: LogActionLinkProps) {
	return (
		<Button
			asChild
			variant={variant}
			size={size}
		>
			<Link
				to="/v2/log"
				search={{ actionId, actionLabel: label, contextLabel, sourcePath }}
			>
				{children ?? label}
			</Link>
		</Button>
	);
}
