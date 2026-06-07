import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowRight, Loader, Tractor } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { V2AuthPageFrame } from "@/features/auth/components/v2-auth-page-frame";
import {
	useAcceptInvitation,
	useResolveInvitationToken,
} from "@/features/farm-invitations/api/farm-invitations-queries";
import { authQueryKeys } from "@/features/auth/api/auth-queries";
import { getUserProfile } from "@/features/auth/api/auth-api";
import {
	resolveAndPersistActiveFarmId,
	saveTokenPair,
} from "@/features/auth/utils/auth-session";
import { ApiRequestError } from "@/lib/axios/axios-helper";

const resolveErrorMessage = (error: Error) => {
	if (error instanceof ApiRequestError) {
		if (error.statusCode === 404)
			return "Este enlace no es valido o fue revocado.";
		if (error.statusCode === 410)
			return "Esta invitacion ha expirado. Solicita una nueva al dueno de la granja.";
		if (error.statusCode === 409)
			return "Esta invitacion ya fue utilizada.";
	}
	return "No se pudo procesar la invitacion.";
};

const acceptSchema = z.object({
	password: z.string().min(8, "Minimo 8 caracteres."),
	name: z.string().optional(),
});

type AcceptFormValues = z.infer<typeof acceptSchema>;

const roleLabelMap: Record<string, string> = {
	admin: "administrador",
	member: "miembro",
};

interface InviteAcceptPageProps {
	token: string;
}

export function InviteAcceptPage({ token }: InviteAcceptPageProps) {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const [submitError, setSubmitError] = useState<string | null>(null);

	const {
		data: invite,
		error: resolveError,
		isLoading,
	} = useResolveInvitationToken(token);

	const { mutateAsync: accept, isPending } = useAcceptInvitation(token);

	const form = useForm<AcceptFormValues>({
		resolver: zodResolver(acceptSchema),
		defaultValues: { password: "", name: "" },
	});

	const isNew = invite?.requires_registration ?? false;

	const onSubmit = async (values: AcceptFormValues) => {
		if (isNew && !values.name?.trim()) {
			form.setError("name", { message: "Ingresa tu nombre completo." });
			return;
		}
		setSubmitError(null);
		try {
			const tokenPair = await accept({
				password: values.password,
				...(isNew ? { name: values.name } : {}),
			});
			saveTokenPair(tokenPair);
			const meResponse = await queryClient.fetchQuery({
				queryKey: authQueryKeys.all,
				queryFn: getUserProfile,
			});
			queryClient.setQueryData(authQueryKeys.all, meResponse);
			resolveAndPersistActiveFarmId(meResponse.memberships);
			await navigate({ to: "/v2/dashboard" });
		} catch (err) {
			if (err instanceof ApiRequestError && err.statusCode === 401) {
				form.setError("password", { message: "Contrasena incorrecta." });
			} else if (err instanceof Error) {
				setSubmitError(err.message);
			}
		}
	};

	if (isLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<Loader className="h-6 w-6 animate-spin text-muted-foreground" />
			</div>
		);
	}

	if (resolveError || !invite) {
		return (
			<V2AuthPageFrame
				eyebrow="Invitacion"
				brandIcon={<Tractor className="h-8 w-8" />}
				title="Ovejitas"
				subtitle=""
				formTitle="Enlace no disponible"
				formSubtitle={resolveErrorMessage(resolveError ?? new Error())}
				footer={null}
			>
				<div />
			</V2AuthPageFrame>
		);
	}

	return (
		<V2AuthPageFrame
			eyebrow="Invitacion a granja"
			brandIcon={<Tractor className="h-8 w-8" />}
			title="Ovejitas"
			subtitle={`Fuiste invitado a unirte a "${invite.farm_name}" como ${roleLabelMap[invite.role] ?? invite.role}.`}
			formTitle={isNew ? "Crea tu cuenta" : "Ingresa tu contrasena"}
			formSubtitle={
				isNew
					? "Completa tu perfil para acceder a la granja."
					: "Confirma tu identidad para unirte a la granja."
			}
			footer={null}
		>
			<div className="mb-5 rounded-xl bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
				Email:{" "}
				<span className="font-medium text-foreground">{invite.email}</span>
			</div>

			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
					{isNew && (
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem className="space-y-1.5">
									<FormLabel>
										Nombre completo
									</FormLabel>
									<FormControl>
										<Input
											type="text"
											autoComplete="name"
											placeholder="Juan Perez"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					)}

					<FormField
						control={form.control}
						name="password"
						render={({ field }) => (
							<FormItem className="space-y-1.5">
								<FormLabel>Contrasena</FormLabel>
								<FormControl>
									<Input
										type="password"
										autoComplete={isNew ? "new-password" : "current-password"}
										placeholder={
											isNew ? "Minimo 8 caracteres" : "Tu contrasena actual"
										}
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					{submitError && (
						<p className="text-sm text-destructive">{submitError}</p>
					)}

					<Button
						type="submit"
						disabled={isPending}
						className="w-full"
					>
						{isPending ? <Loader className="h-4 w-4 animate-spin" /> : null}
						Unirse a la granja
						<ArrowRight className="h-4 w-4" />
					</Button>
				</form>
			</Form>
		</V2AuthPageFrame>
	);
}
