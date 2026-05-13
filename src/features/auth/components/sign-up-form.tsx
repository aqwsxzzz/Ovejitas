import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { useSignUp } from "@/features/auth/api/auth-queries";
import { Loader } from "lucide-react";
import { Link } from "@tanstack/react-router";

const formSchema = z.object({
	email: z.string().email(),
	displayName: z.string().min(2, "El nombre debe tener al menos 2 caracteres."),
	password: z
		.string()
		.min(8, "La contrasena debe tener al menos 8 caracteres."),
});

export const SignUpForm = ({
	token,
	email,
}: {
	token?: string;
	email?: string;
}) => {
	const { mutateAsync: signUp, error, isPending } = useSignUp();

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: { email: email ?? "", displayName: "", password: "" },
	});

	const onSubmit = async (data: z.infer<typeof formSchema>) => {
		if (token) {
			await signUp({ payload: { ...data, invitationToken: token } });
		} else {
			await signUp({ payload: data });
		}
	};

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="flex flex-col gap-7"
			>
				<FormField
					control={form.control}
					name="email"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Correo electronico</FormLabel>
							<FormControl>
								{email ? (
									<div className="bg-muted text-muted-foreground px-3 py-2 rounded">
										{email}
										<Link
											to="/signup"
											className="ml-2 text-blue-600 underline text-xs"
										>
											No soy yo?
										</Link>{" "}
									</div>
								) : (
									<Input
										type="email"
										autoComplete="email"
										autoCapitalize="none"
										autoCorrect="off"
										spellCheck={false}
										placeholder="Ingresa tu correo electronico"
										{...field}
									/>
								)}
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="displayName"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Nombre</FormLabel>
							<FormControl>
								<Input
									placeholder="Ingresa tu nombre"
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
						<FormItem>
							<FormLabel>Contrasena</FormLabel>
							<FormControl>
								<Input
									autoComplete="new-password"
									placeholder="Ingresa tu contrasena"
									{...field}
									type="password"
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				{error && <p className="text-destructive">{error.message}</p>}
				<Button type="submit">
					{isPending ? <Loader className="animate-spin" /> : "Crear cuenta"}
				</Button>
			</form>
		</Form>
	);
};
