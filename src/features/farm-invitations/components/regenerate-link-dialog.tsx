import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogTitle,
	DialogDescription,
	DialogHeader,
	DialogFooter,
} from "@/components/ui/dialog";
import { useRegenerateInvitation } from "@/features/farm-invitations/api/farm-invitations-queries";
import type {
	IInvitationRead,
	InvitationRole,
} from "@/features/farm-invitations/types/farm-invitations-types";
import { Check, Copy, RefreshCw } from "lucide-react";

interface RegenerateLinkDialogProps {
	invitation: IInvitationRead;
	farmId: string;
}

export const RegenerateLinkDialog = ({
	invitation,
	farmId,
}: RegenerateLinkDialogProps) => {
	const [open, setOpen] = useState(false);
	const [newLink, setNewLink] = useState<string | null>(null);
	const [copied, setCopied] = useState(false);

	const { mutateAsync: regenerate, isPending } = useRegenerateInvitation({
		farmId,
	});

	const handleClose = () => {
		setOpen(false);
		setNewLink(null);
		setCopied(false);
	};

	const handleRegenerate = async () => {
		const result = await regenerate({
			invitationId: invitation.id,
			email: invitation.email,
			role: invitation.role as InvitationRole,
		});
		const link = `${window.location.origin}/invite?token=${result.token}`;
		setNewLink(link);
	};

	const handleCopy = async () => {
		if (!newLink) return;
		await navigator.clipboard.writeText(newLink);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<>
			<Button
				variant="ghost"
				size="icon"
				className="h-7 w-7 text-muted-foreground hover:text-foreground"
				onClick={() => setOpen(true)}
				title="Regenerar enlace"
			>
				<RefreshCw className="h-3.5 w-3.5" />
			</Button>

			<Dialog open={open} onOpenChange={handleClose}>
				<DialogContent className="gap-4 p-5 sm:p-6">
					<DialogHeader>
						<DialogTitle>Regenerar enlace de invitacion</DialogTitle>
						<DialogDescription>
							{newLink
								? "Nuevo enlace generado. Compártelo antes de cerrar."
								: `La invitacion actual para ${invitation.email} sera revocada y se generara un nuevo enlace de un solo uso.`}
						</DialogDescription>
					</DialogHeader>

					{newLink ? (
						<>
							<div className="rounded-lg border bg-muted/40 p-3 text-xs break-all font-mono text-muted-foreground">
								{newLink}
							</div>
							<DialogFooter>
								<Button variant="outline" onClick={handleClose}>
									Cerrar
								</Button>
								<Button onClick={handleCopy}>
									{copied ? (
										<Check className="h-4 w-4" />
									) : (
										<Copy className="h-4 w-4" />
									)}
									{copied ? "Copiado" : "Copiar enlace"}
								</Button>
							</DialogFooter>
						</>
					) : (
						<DialogFooter>
							<Button variant="outline" onClick={handleClose}>
								Cancelar
							</Button>
							<Button onClick={handleRegenerate} disabled={isPending}>
								<RefreshCw className="h-4 w-4" />
								{isPending ? "Generando..." : "Regenerar enlace"}
							</Button>
						</DialogFooter>
					)}
				</DialogContent>
			</Dialog>
		</>
	);
};
