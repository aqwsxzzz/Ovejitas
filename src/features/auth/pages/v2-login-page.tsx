import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "@tanstack/react-router";
import {
	ArrowRight,
	Eye,
	EyeOff,
	Loader,
	PawPrint,
	ShieldCheck,
} from "lucide-react";
import { useState } from "react";
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
import { useLogin } from "@/features/auth/api/auth-queries";
import {
	V2AuthPageFrame,
	v2AuthInputClassName,
	v2AuthLabelClassName,
	v2AuthSubmitClassName,
} from "@/features/auth/components/v2-auth-page-frame";

const loginSchema = z.object({
	email: z.string().email("Ingresa un correo electronico valido."),
	password: z
		.string()
		.min(8, "La contrasena debe tener al menos 8 caracteres."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function V2LoginPage() {
	const { mutateAsync: login, isPending } = useLogin();
	const [isPasswordVisible, setIsPasswordVisible] = useState(false);
	const form = useForm<LoginFormValues>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	const handleSubmit = async (data: LoginFormValues) => {
		await login({ payload: data });
	};

	return (
		<V2AuthPageFrame
			eyebrow="Ingreso - Ovejitas"
			brandIcon={<PawPrint className="h-8 w-8" />}
			title="Ovejitas"
			subtitle="Agricultura de precision y manejo ganadero en un solo lugar."
			formTitle="Bienvenido otra vez"
			formSubtitle="Accede al tablero principal de tu finca"
			footer={
				<p>
					No tienes una cuenta?{" "}
					<Link
						to="/v2/signup"
						className="font-semibold text-[#0b3445] underline-offset-4 hover:underline"
					>
						Crear cuenta
					</Link>
				</p>
			}
			bottomSlot={
				<div className="flex items-center justify-center gap-2 rounded-full border border-[rgba(27,54,48,0.1)] bg-white/80 px-4 py-2 text-[0.7rem] font-medium uppercase tracking-[0.16em] text-[rgba(27,54,48,0.45)]">
					<ShieldCheck className="h-3.5 w-3.5" />
					Seguridad de nivel empresarial
				</div>
			}
		>
			<Form {...form}>
				<form
					onSubmit={form.handleSubmit(handleSubmit)}
					className="space-y-4"
				>
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
								<div className="flex items-center justify-between gap-3">
									<FormLabel className={v2AuthLabelClassName}>
										Contrasena
									</FormLabel>
									<span className="text-xs font-medium text-[rgba(27,54,48,0.58)]">
										Recuperacion pronto
									</span>
								</div>
								<div className="relative">
									<FormControl>
										<Input
											type={isPasswordVisible ? "text" : "password"}
											autoComplete="current-password"
											placeholder="Ingresa tu contrasena"
											className={`${v2AuthInputClassName} pr-12`}
											{...field}
										/>
									</FormControl>
									<Button
										type="button"
										variant="ghost"
										size="icon"
										onClick={() => setIsPasswordVisible((current) => !current)}
										className="absolute inset-y-0 right-0 h-full w-12 rounded-none bg-transparent text-[rgba(27,54,48,0.65)] shadow-none hover:bg-transparent hover:text-(--v2-ink)"
										aria-label={
											isPasswordVisible
												? "Ocultar contrasena"
												: "Mostrar contrasena"
										}
									>
										{isPasswordVisible ? (
											<EyeOff className="h-4 w-4" />
										) : (
											<Eye className="h-4 w-4" />
										)}
									</Button>
								</div>
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
						Iniciar sesion
						<ArrowRight className="h-4 w-4" />
					</Button>
				</form>
			</Form>
		</V2AuthPageFrame>
	);
}
