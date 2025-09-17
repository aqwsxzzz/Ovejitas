import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	DropdownMenuItem,
	DropdownMenuShortcut,
} from "@/components/ui/dropdown-menu";
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
import { useState } from "react";
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
	const { farmId } = useParams({ strict: false });

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: "",
		},
	});
	const onSubmit = async (data: z.infer<typeof formSchema>) => {
		const response = await sendInvitation({
			payload: { email: data.email, farmId: farmId! },
		});
		if (response.status == "success") {
			form.reset();
			setOpen(false);
		}
	};

	return (
		<Dialog
			open={open}
			onOpenChange={setOpen}
		>
			<DialogTrigger asChild>
				<DropdownMenuItem
					className="flex justify-between items-center"
					onSelect={(e) => {
						e.preventDefault();
						e.stopPropagation();
					}}
				>
					{t("invite")}
					<DropdownMenuShortcut className="text-primary text-center w-4">
						I
					</DropdownMenuShortcut>
				</DropdownMenuItem>
			</DialogTrigger>
			<DialogContent>
				<DialogTitle>Invite to Farm</DialogTitle>
				<DialogDescription></DialogDescription>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)}>
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
										/>
									</FormControl>
								</FormItem>
							)}
						/>
						<div>
							<Button
								disabled={isPending}
								type="submit"
							>
								Send Invitation
							</Button>
							<Button className="bg-destructive">Cancel</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
};
