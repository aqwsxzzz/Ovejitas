import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useSendFarmInvitation } from "@/features/farm-invitations/api/farm-invitations-queries";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";

const formSchema = z.object({
	email: z.string().email(),
});

export const FarmInviteModal = () => {
	const { t } = useTranslation("dropdownMenuHeader");
	const { mutateAsync: sendInvitation, isPending } = useSendFarmInvitation();
	const [open, setOpen] = useState<boolean>(false);
	const [token, setToken] = useState<boolean>(false);
	const [tokenData, setTokenData] = useState<string | null>(null);
	const { farmId } = useParams({ strict: false });
	const inputRef = useRef<HTMLInputElement>(null);

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: "",
		},
	});

	const resetStates = () => {
		setToken(false);
		setTokenData(null);
		form.reset();
	};

	const handleOpenChange = (isOpen: boolean) => {
		setOpen(isOpen);
		if (isOpen) resetStates();
	};

	const onSubmit = async (data: z.infer<typeof formSchema>) => {
		const response = await sendInvitation({
			payload: { email: data.email, farmId: farmId! },
		});
		if (response.status == "success") {
			setToken(true);
			setTokenData(response.data.token);
			form.reset();
		}
	};

	return (
		<Dialog
			open={open}
			onOpenChange={handleOpenChange}
		>
			<DialogTrigger asChild>
				<Button>{t("invite")}</Button>
			</DialogTrigger>
			<DialogContent className="flex flex-col gap-4">
				<div className="flex flex-col gap-2">
					<DialogTitle className="text-center">Invite to Farm</DialogTitle>
					{!token && (
						<DialogDescription>
							Here you can invite a friend to your farm as a member to help you.
						</DialogDescription>
					)}
				</div>
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="flex gap-2 flex-col"
					>
						{!token && (
							<div className="flex gap-2 flex-col">
								<FormField
									control={form.control}
									name="email"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Email</FormLabel>
											<FormControl>
												<Input
													placeholder="Enter email"
													{...field}
													autoComplete="off"
												/>
											</FormControl>
										</FormItem>
									)}
								/>
								<div className="flex justify-around">
									<Button
										disabled={isPending}
										type="submit"
									>
										Create Invitation
									</Button>
									<DialogClose asChild>
										<Button className="bg-destructive">Cancel</Button>
									</DialogClose>
								</div>
							</div>
						)}
						{token && (
							<div className="w-full flex flex-col items-center gap-2">
								<p className="mb-1 text-sm text-muted-foreground">
									Copy and share this invitation link with your friend:
								</p>
								<div className="flex w-full max-w-xl gap-2">
									<Input
										className="flex-1"
										value={`${import.meta.env.VITE_BASIC_URL}/signup?token=${tokenData}`}
										readOnly
										onClick={(e) => e.currentTarget.select()}
										ref={inputRef}
									/>
									<Button
										type="button"
										onClick={() => {
											if (inputRef.current) {
												inputRef.current.select();
												navigator.clipboard
													.writeText(inputRef.current.value)
													.then(() => {
														toast.success("Invitation link copied!");
														handleOpenChange(false);
													});
											}
										}}
										variant="outline"
									>
										Copy
									</Button>
								</div>
							</div>
						)}
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
};
