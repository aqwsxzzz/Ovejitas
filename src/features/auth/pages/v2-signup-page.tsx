import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Loader, Tractor } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
import { useSignUp } from "@/features/auth/api/auth-queries";
import {
	V2AuthPageFrame,
	v2AuthInputClassName,
	v2AuthLabelClassName,
	v2AuthSubmitClassName,
} from "@/features/auth/components/v2-auth-page-frame";

const signupSchema = z
	.object({
		email: z.string().email("Ingresa un correo electronico valido."),
		displayName: z.string().min(2, "Ingresa tu nombre completo."),
		password: z
			.string()
			.min(8, "La contrasena debe tener al menos 8 caracteres."),
		confirmPassword: z
			.string()
			.min(8, "Confirma la contrasena con al menos 8 caracteres."),
	})
	.refine((values) => values.password === values.confirmPassword, {
		message: "Las contrasenas deben coincidir.",
		path: ["confirmPassword"],
	});

type SignUpFormValues = z.infer<typeof signupSchema>;

export function V2SignupPage() {
	const { mutateAsync: signUp, isPending } = useSignUp();
	const form = useForm<SignUpFormValues>({
		resolver: zodResolver(signupSchema),
		defaultValues: {
			email: "",
			displayName: "",
			password: "",
			confirmPassword: "",
		},
	});

	const handleSubmit = async (data: SignUpFormValues) => {
		await signUp({
			payload: {
				email: data.email,
				displayName: data.displayName,
				password: data.password,
			},
		});
	};

	return (
		<V2AuthPageFrame
			eyebrow="Registro - Ovejitas"
			brandIcon={<Tractor className="h-8 w-8" />}
			title="Ovejitas"
			subtitle="Sumate al manejo ganadero de precision con una experiencia clara y moderna."
			formTitle="Crear cuenta"
			formSubtitle="Activa tu espacio de trabajo y empieza a organizar tu finca"
			footer={
				<p>
					Ya tienes una cuenta?{" "}
					<Link
						to="/v2/login"
						className="font-semibold text-[#0b3445] underline-offset-4 hover:underline"
					>
						Inicia sesion en Ovejitas
					</Link>
				</p>
			}
			legal="Al crear una cuenta, aceptas nuestros terminos de servicio y politicas de privacidad."
		>
			<Form {...form}>
				<form
					onSubmit={form.handleSubmit(handleSubmit)}
					className="space-y-4"
				>
					<FormField
						control={form.control}
						name="displayName"
						render={({ field }) => (
							<FormItem className="space-y-1.5">
								<FormLabel className={v2AuthLabelClassName}>
									Nombre completo
								</FormLabel>
								<FormControl>
									<Input
										type="text"
										autoComplete="name"
										placeholder="Juan Perez"
										className={v2AuthInputClassName}
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="email"
						render={({ field }) => (
							<FormItem className="space-y-1.5">
								<FormLabel className={v2AuthLabelClassName}>
									Correo electronico
								</FormLabel>
								<FormControl>
									<Input
										type="email"
										autoComplete="email"
										autoCapitalize="none"
										autoCorrect="off"
										spellCheck={false}
										placeholder="manager@farm.com"
										className={v2AuthInputClassName}
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="password"
						render={({ field }) => (
							<FormItem className="space-y-1.5">
								<FormLabel className={v2AuthLabelClassName}>
									Contrasena
								</FormLabel>
								<FormControl>
									<Input
										type="password"
										autoComplete="new-password"
										placeholder="Minimo 8 caracteres"
										className={v2AuthInputClassName}
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="confirmPassword"
						render={({ field }) => (
							<FormItem className="space-y-1.5">
								<FormLabel className={v2AuthLabelClassName}>
									Confirmar contrasena
								</FormLabel>
								<FormControl>
									<Input
										type="password"
										autoComplete="new-password"
										placeholder="Repite tu contrasena"
										className={v2AuthInputClassName}
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<Button
						type="submit"
						disabled={isPending}
						className={v2AuthSubmitClassName}
					>
						{isPending ? <Loader className="h-4 w-4 animate-spin" /> : null}
						Crear cuenta
						<ArrowRight className="h-4 w-4" />
					</Button>
				</form>
			</Form>
		</V2AuthPageFrame>
	);
}
