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
import { Textarea } from "@/components/ui/textarea";
import {
	useCreateEggCollection,
	useUpdateEggCollection,
} from "@/features/flock/api/flock-queries";
import type { IEggCollection } from "@/features/flock/types/flock-types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";

const formSchema = z.object({
	date: z.string().optional(),
	totalEggs: z.coerce.number().int().min(0),
	brokenEggs: z.coerce.number().int().min(0),
	notes: z.string().max(500).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface BaseProps {
	flockId: string;
	farmId: string;
	onClose: () => void;
}

type RecordEggCollectionFormProps =
	| (BaseProps & { mode: "create" })
	| (BaseProps & { mode: "edit"; collection: IEggCollection });

export const RecordEggCollectionForm = (
	props: RecordEggCollectionFormProps,
) => {
	const { flockId, farmId, onClose } = props;
	const { t } = useTranslation("flocks");
	const { mutateAsync: createCollection, isPending: isCreating } =
		useCreateEggCollection();
	const { mutateAsync: updateCollection, isPending: isUpdating } =
		useUpdateEggCollection();
	const isPending = isCreating || isUpdating;

	const defaultValues: FormValues =
		props.mode === "edit"
			? {
					totalEggs: props.collection.totalEggs,
					brokenEggs: props.collection.brokenEggs,
					notes: props.collection.notes ?? "",
				}
			: {
					date: new Date().toISOString().slice(0, 10),
					totalEggs: 0,
					brokenEggs: 0,
					notes: "",
				};

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues,
	});

	const totalEggs = useWatch({ control: form.control, name: "totalEggs" });
	const brokenEggs = useWatch({ control: form.control, name: "brokenEggs" });
	const usableEggs = Math.max(
		0,
		(Number(totalEggs) || 0) - (Number(brokenEggs) || 0),
	);

	const onSubmit = async (values: FormValues) => {
		if ((values.brokenEggs ?? 0) > values.totalEggs) {
			form.setError("brokenEggs", {
				message: t("detail.eggCollections.form.brokenExceedsTotal"),
			});
			return;
		}

		if (props.mode === "create") {
			const response = await createCollection({
				flockId,
				farmId,
				payload: {
					date: values.date!,
					totalEggs: values.totalEggs,
					brokenEggs: values.brokenEggs,
					notes: values.notes || undefined,
				},
			});
			if (response.status === "success") onClose();
		} else {
			const response = await updateCollection({
				flockId,
				farmId,
				collectionId: props.collection.id,
				payload: {
					totalEggs: values.totalEggs,
					brokenEggs: values.brokenEggs,
					notes: values.notes || undefined,
				},
			});
			if (response.status === "success") onClose();
		}
	};

	return (
		<Form {...form}>
			<form
				className="flex flex-col gap-3"
				onSubmit={form.handleSubmit(onSubmit)}
			>
				{props.mode === "create" && (
					<FormField
						control={form.control}
						name="date"
						render={({ field }) => (
							<FormItem>
								<FormLabel>{t("detail.eggCollections.form.date")}</FormLabel>
								<FormControl>
									<Input
										type="date"
										required
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
					name="totalEggs"
					render={({ field }) => (
						<FormItem>
							<FormLabel>{t("detail.eggCollections.form.totalEggs")}</FormLabel>
							<FormControl>
								<Input
									type="number"
									min={0}
									step={1}
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="brokenEggs"
					render={({ field }) => (
						<FormItem>
							<FormLabel>
								{t("detail.eggCollections.form.brokenEggs")}
							</FormLabel>
							<FormControl>
								<Input
									type="number"
									min={0}
									step={1}
									{...field}
								/>
							</FormControl>
							<p className="text-xs text-muted-foreground">
								{t("detail.eggCollections.form.usableHelp", {
									count: usableEggs,
								})}
							</p>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="notes"
					render={({ field }) => (
						<FormItem>
							<FormLabel>{t("detail.eggCollections.form.notes")}</FormLabel>
							<FormControl>
								<Textarea
									placeholder={t("detail.eggCollections.form.notesPlaceholder")}
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
				>
					{props.mode === "create"
						? isPending
							? t("detail.eggCollections.form.submitting")
							: t("detail.eggCollections.form.submit")
						: isPending
							? t("detail.eggCollections.form.updating")
							: t("detail.eggCollections.form.update")}
				</Button>
			</form>
		</Form>
	);
};
