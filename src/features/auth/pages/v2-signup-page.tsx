import { Loader } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { useSignUp } from "@/features/auth/api/auth-queries";

const signupSchema = z.object({
	email: z.string().email(),
	displayName: z.string().min(2),
	password: z.string().min(8),
});

type SignUpFormValues = z.infer<typeof signupSchema>;

export function V2SignupPage() {
	const { t } = useTranslation("signup");
	const { mutateAsync: signUp, isPending } = useSignUp();
	const form = useForm<SignUpFormValues>({
		resolver: zodResolver(signupSchema),
		defaultValues: {
			email: "",
			displayName: "",
			password: "",
		},
	});

	const handleSubmit = async (data: SignUpFormValues) => {
		await signUp({ payload: data });
	};

	return (
		<div className="v2-theme v2-page min-h-screen">
			<div className="mx-auto grid min-h-screen w-full max-w-2xl grid-rows-1 gap-6 px-4 py-6 place-items-center md:px-6 md:py-8">
				<section className="v2-card w-full p-5 md:p-8">
					<div className="w-full">
						<p className="v2-kicker">Ovejitas V2</p>
						<h2 className="mt-2 text-2xl font-semibold md:text-3xl">
							Crear cuenta
						</h2>

						<form
							onSubmit={form.handleSubmit(handleSubmit)}
							className="mt-6 space-y-4"
						>
							<div className="space-y-1.5">
								<label
									htmlFor="v2-signup-email"
									className="text-sm font-medium"
								>
									{t("emailInputLabel")}
								</label>
								<input
									id="v2-signup-email"
									type="email"
									autoComplete="email"
									autoCapitalize="none"
									autoCorrect="off"
									spellCheck={false}
									placeholder={t("emailPlaceholder")}
									className="h-12 w-full rounded-2xl border border-[color:var(--v2-border)] bg-white px-4 text-sm outline-none transition focus:border-[color:var(--v2-ink)]"
									{...form.register("email")}
								/>
								{form.formState.errors.email ? (
									<p className="text-sm text-destructive">
										{form.formState.errors.email.message}
									</p>
								) : null}
							</div>

							<div className="space-y-1.5">
								<label
									htmlFor="v2-signup-displayName"
									className="text-sm font-medium"
								>
									{t("displayNameInputLabel")}
								</label>
								<input
									id="v2-signup-displayName"
									type="text"
									autoComplete="name"
									placeholder={t("displayNamePlaceholder")}
									className="h-12 w-full rounded-2xl border border-[color:var(--v2-border)] bg-white px-4 text-sm outline-none transition focus:border-[color:var(--v2-ink)]"
									{...form.register("displayName")}
								/>
								{form.formState.errors.displayName ? (
									<p className="text-sm text-destructive">
										{form.formState.errors.displayName.message}
									</p>
								) : null}
							</div>

							<div className="space-y-1.5">
								<label
									htmlFor="v2-signup-password"
									className="text-sm font-medium"
								>
									{t("passwordInputLabel")}
								</label>
								<input
									id="v2-signup-password"
									type="password"
									autoComplete="new-password"
									placeholder={t("passwordPlaceholder")}
									className="h-12 w-full rounded-2xl border border-[color:var(--v2-border)] bg-white px-4 text-sm outline-none transition focus:border-[color:var(--v2-ink)]"
									{...form.register("password")}
								/>
								{form.formState.errors.password ? (
									<p className="text-sm text-destructive">
										{form.formState.errors.password.message}
									</p>
								) : null}
							</div>

							<button
								type="submit"
								disabled={isPending}
								className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-black/20 bg-[#1f211d] px-4 text-sm font-semibold text-[#f5efe0] transition hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-70"
							>
								{isPending ? <Loader className="h-4 w-4 animate-spin" /> : null}
								{t("createAccountButton")}
							</button>
						</form>

						<div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[color:var(--v2-border)] pt-4 text-sm text-[color:var(--v2-ink-soft)]">
							<p>{t("footerTitle")}</p>
							<Link
								to="/v2/login"
								className="font-semibold text-[color:var(--v2-ink)] underline-offset-4 hover:underline"
							>
								{t("footerLink")}
							</Link>
						</div>
					</div>
				</section>
			</div>
		</div>
	);
}
