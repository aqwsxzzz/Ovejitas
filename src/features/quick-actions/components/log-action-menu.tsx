import { Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface LogActionMenuItem {
	actionId: string;
	label: string;
}

interface LogActionMenuProps {
	actions: readonly LogActionMenuItem[];
	sourcePath: string;
	contextLabel?: string;
}

/**
 * Compact contextual entry point: a single "+" trigger that opens a short menu
 * of working quick-log actions. Each item routes into `/v2/log`.
 */
export function LogActionMenu({
	actions,
	sourcePath,
	contextLabel,
}: LogActionMenuProps) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					type="button"
					variant="default"
					size="icon"
					aria-label="Registrar"
				>
					<Plus className="h-4 w-4" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				{actions.map((action) => (
					<DropdownMenuItem
						key={action.actionId}
						asChild
					>
						<Link
							to="/v2/log"
							search={{
								actionId: action.actionId,
								actionLabel: action.label,
								contextLabel,
								sourcePath,
							}}
						>
							{action.label}
						</Link>
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
