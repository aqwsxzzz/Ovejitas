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
import { useLogin } from "@/features/auth/api/auth-queries";
import { useTranslation } from "react-i18next";
import { Loader } from "lucide-react";

const formSchema = z.object({
	email: z.string().email(),
	password: z.string(),
});

export const LoginForm = () => {
	const { mutateAsync: login, isPending } = useLogin();

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: { email: "", password: "" },
	});
	const onSubmit = async (data: z.infer<typeof formSchema>) => {
		await login({ payload: data });
	};

	const password = form.watch("password");

	const { t } = useTranslation("login");
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
							<FormLabel>{t("emailInputLabel")}</FormLabel>
							<FormControl>
								<Input
									placeholder={t("emailPlaceholder")}
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
							<FormLabel>{t("passwordInputLabel")}</FormLabel>
							<FormControl>
								<Input
									autoComplete="new-password"
									placeholder={t("passwordPlaceholder")}
									{...field}
									type="password"
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<Button
					type="submit"
					disabled={password.length < 8}
				>
					{isPending ? <Loader className="animate-spin" /> : t("loginButton")}
				</Button>
			</form>
		</Form>
	);
};
