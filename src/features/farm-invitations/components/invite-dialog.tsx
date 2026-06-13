import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogTitle,
	DialogDescription,
	DialogHeader,
	DialogFooter,
} from "@/components/ui/dialog";
import {
	Form,
	FormField,
	FormItem,
	FormLabel,
	FormControl,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useCreateFarmInvitation } from "@/features/farm-invitations/api/farm-invitations-queries";
import { Check, Copy, UserPlus } from "lucide-react";

const inviteSchema = z.object({
	email: z.string().email("Email invalido"),
	role: z.enum(["admin", "member"]),
});

type InviteFormValues = z.infer<typeof inviteSchema>;

interface InviteDialogProps {
	farmId: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export const InviteDialog = ({
	farmId,
	open,
	onOpenChange,
}: InviteDialogProps) => {
	const [inviteLink, setInviteLink] = useState<string | null>(null);
	const [copied, setCopied] = useState(false);

	const { mutateAsync: createInvitation, isPending } =
		useCreateFarmInvitation({ farmId });

	const form = useForm<InviteFormValues>({
		resolver: zodResolver(inviteSchema),
		defaultValues: { email: "", role: "member" },
	});

	const handleClose = () => {
		setInviteLink(null);
		setCopied(false);
		form.reset();
		onOpenChange(false);
	};

	const onSubmit = async (values: InviteFormValues) => {
		const result = await createInvitation(values);
		const link = `${window.location.origin}/invite?token=${result.token}`;
		setInviteLink(link);
	};

	const handleCopy = async () => {
		if (!inviteLink) return;
		await navigator.clipboard.writeText(inviteLink);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent className="gap-4 p-5 sm:p-6">
				<DialogHeader>
					<DialogTitle>Invitar a la granja</DialogTitle>
					<DialogDescription>
						Genera un enlace de un solo uso valido por 7 dias.
					</DialogDescription>
				</DialogHeader>

				{!inviteLink ? (
					<Form {...form}>
						<form
							onSubmit={form.handleSubmit(onSubmit)}
							className="flex flex-col gap-4"
						>
							<FormField
								control={form.control}
								name="email"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Email</FormLabel>
										<FormControl>
											<Input
												type="email"
												placeholder="persona@ejemplo.com"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="role"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Rol</FormLabel>
										<Select
											onValueChange={field.onChange}
											defaultValue={field.value}
										>
											<FormControl>
												<SelectTrigger className="w-full">
													<SelectValue placeholder="Selecciona un rol" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectItem value="member">Miembro</SelectItem>
												<SelectItem value="admin">Admin</SelectItem>
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
							<DialogFooter className="pt-1">
								<Button
									type="button"
									variant="outline"
									onClick={handleClose}
								>
									Cancelar
								</Button>
								<Button type="submit" disabled={isPending}>
									<UserPlus className="h-4 w-4" />
									Generar enlace
								</Button>
							</DialogFooter>
						</form>
					</Form>
				) : (
					<>
						<p className="text-sm text-muted-foreground">
							Comparte este enlace. Solo puede usarse una vez y expira en 7
							dias.
						</p>
						<div className="rounded-lg border bg-muted/40 p-3 text-xs break-all font-mono text-muted-foreground">
							{inviteLink}
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
				)}
			</DialogContent>
		</Dialog>
	);
};
