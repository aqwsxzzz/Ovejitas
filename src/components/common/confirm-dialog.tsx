import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

interface ConfirmDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	description: ReactNode;
	/** Defaults to a destructive confirm, which is what most callers want. */
	confirmLabel?: string;
	cancelLabel?: string;
	isDestructive?: boolean;
	isPending?: boolean;
	onConfirm: () => void;
}

/**
 * Asks before an irreversible action.
 *
 * Replaces `window.confirm`, which is unstyled, untranslatable, and the only
 * modal in the app that does not look like the app. Built on the existing
 * Dialog primitive rather than pulling in Radix's alert-dialog, so it adds no
 * dependency.
 */
export function ConfirmDialog({
	open,
	onOpenChange,
	title,
	description,
	confirmLabel = "Eliminar",
	cancelLabel = "Cancelar",
	isDestructive = true,
	isPending = false,
	onConfirm,
}: ConfirmDialogProps) {
	return (
		<Dialog
			open={open}
			onOpenChange={onOpenChange}
		>
			<DialogContent className="w-[calc(100vw-2rem)] max-w-112 p-4 sm:p-6">
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					<DialogDescription>{description}</DialogDescription>
				</DialogHeader>
				<DialogFooter className="gap-2 sm:gap-2">
					<Button
						type="button"
						variant="outline"
						onClick={() => onOpenChange(false)}
						disabled={isPending}
					>
						{cancelLabel}
					</Button>
					<Button
						type="button"
						variant={isDestructive ? "destructive" : "default"}
						onClick={onConfirm}
						disabled={isPending}
					>
						{isPending ? "Procesando..." : confirmLabel}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
