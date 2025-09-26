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
import { useTranslation } from "react-i18next";
import { Loader } from "lucide-react";

const formSchema = z.object({
	email: z.string().email(),
	displayName: z.string().min(2, "Name must have at least 2 characters."),
	password: z.string().min(8, "Password must have at least 8 characters."),
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

	const { t } = useTranslation("signup");
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
									readOnly={email !== undefined}
								/>
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
							<FormLabel>{t("displayNameInputLabel")}</FormLabel>
							<FormControl>
								<Input
									placeholder={t("displayNamePlaceholder")}
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
				{error && <p className="text-destructive">{error.message}</p>}
				<Button type="submit">
					{isPending ? (
						<Loader className="animate-spin" />
					) : (
						t("createAccountButton")
					)}
				</Button>
			</form>
		</Form>
	);
};
