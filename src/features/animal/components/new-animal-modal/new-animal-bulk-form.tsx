import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { SpecieSelect } from "@/features/specie/components/species-select";
import { BreedSelect } from "@/features/breed/components/breed-select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useCreateAnimalBulk } from "@/features/animal/api/animal-queries";
import type {
	ICreateAnimalBulkFailedItem,
	ICreateAnimalBulkResponse,
} from "@/features/animal/types/animal-types";
import { useParams } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";

const optionalNumberField = z.preprocess((value) => {
	if (value === "" || value === null || value === undefined) {
		return undefined;
	}

	if (typeof value === "number") {
		return Number.isNaN(value) ? undefined : value;
	}

	const parsedValue = Number(value);
	return Number.isNaN(parsedValue) ? undefined : parsedValue;
}, z.number().optional());

const createFormSchema = (messages: {
	specieRequired: string;
	breedRequired: string;
	tagsRequired: string;
	quantityRequired: string;
	tagStartingNumberRequired: string;
}) =>
	z
		.object({
			specieId: z.string().min(1, {
				message: messages.specieRequired,
			}),
			breedId: z.string().min(1, {
				message: messages.breedRequired,
			}),
			groupName: z.string().optional(),
			count: optionalNumberField,
			tagPrefix: z.string().optional(),
			tagMode: z.enum(["manual", "sequential"]),
			tags: z.string().optional(),
			tagStartNumber: optionalNumberField,
		})
		.superRefine((data, ctx) => {
			if (data.tagMode === "manual" && !data.tags?.trim()) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: messages.tagsRequired,
					path: ["tags"],
				});
			}

			if (data.tagMode === "sequential") {
				if (data.count === undefined) {
					ctx.addIssue({
						code: z.ZodIssueCode.custom,
						message: messages.quantityRequired,
						path: ["count"],
					});
				}

				if (data.tagStartNumber === undefined) {
					ctx.addIssue({
						code: z.ZodIssueCode.custom,
						message: messages.tagStartingNumberRequired,
						path: ["tagStartNumber"],
					});
				}
			}
		});

export const NewAnimalBulkForm = ({
	closeDialog,
}: {
	closeDialog: () => void;
}) => {
	const [bulkCreateResult, setBulkCreateResult] = useState<{
		createdCount: number;
		failedCount: number;
		failedItems: ICreateAnimalBulkFailedItem[];
	} | null>(null);

	const { t } = useTranslation("newAnimalBulkForm");
	const formSchema = createFormSchema({
		specieRequired: t("validation.specieRequired"),
		breedRequired: t("validation.breedRequired"),
		tagsRequired: t("validation.tagsRequired"),
		quantityRequired: t("validation.quantityRequired"),
		tagStartingNumberRequired: t("validation.tagStartingNumberRequired"),
	});

	const form = useForm<
		z.input<typeof formSchema>,
		unknown,
		z.output<typeof formSchema>
	>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			specieId: "",
			breedId: "",
			groupName: "",
			count: 1,
			tagPrefix: "",
			tagMode: "manual",
			tags: "",
			tagStartNumber: 0,
		},
	});
	const selectedSpecieId = form.watch("specieId");
	const tagMode = form.watch("tagMode");

	const { mutateAsync: createAnimalBulk, isPending } = useCreateAnimalBulk();
	const { farmId } = useParams({ strict: false });

	const mapBulkCreateResult = (responseData: ICreateAnimalBulkResponse) => ({
		createdCount: responseData.created.length,
		failedCount: responseData.failed.length,
		failedItems: responseData.failed,
	});

	const onSubmit = async (data: z.output<typeof formSchema>) => {
		setBulkCreateResult(null);

		if (tagMode === "manual") {
			const tagsArray = data.tags
				?.split(" ")
				.map((tag) => tag.trim())
				.filter(Boolean);

			const response = await createAnimalBulk({
				payload: {
					speciesId: data.specieId,
					breedId: data.breedId,
					groupName: data.groupName ?? null,
					tagPrefix: data.tagPrefix ?? null,
					tags: tagsArray ?? null,
				},
				farmId: farmId!,
				filters: {
					speciesId: data.specieId,
				},
			});

			setBulkCreateResult(mapBulkCreateResult(response.data));
			if (response.status === "success") {
				if (response.data.failed.length === 0) {
					closeDialog();
				}
			}
			return;
		}

		if (tagMode === "sequential") {
			const response = await createAnimalBulk({
				payload: {
					speciesId: data.specieId,
					breedId: data.breedId,
					groupName: data.groupName ?? null,
					tagPrefix: data.tagPrefix ?? null,
					tagStartNumber: data.tagStartNumber ?? null,
					count: data.count ?? null,
				},
				farmId: farmId!,
				filters: {
					speciesId: data.specieId,
				},
			});

			setBulkCreateResult(mapBulkCreateResult(response.data));
			if (response.status === "success") {
				if (response.data.failed.length === 0) {
					closeDialog();
				}
			}
			return;
		}
	};

	return (
		<Form {...form}>
			<form
				className="flex flex-col gap-2"
				onSubmit={form.handleSubmit(onSubmit)}
			>
				<FormField
					control={form.control}
					name="specieId"
					render={({ field }) => (
						<FormItem>
							<FormLabel>{t("specieLabel") + " *"}</FormLabel>
							<FormControl>
								<SpecieSelect
									value={field.value}
									onChange={field.onChange}
									defaultValue={field.value}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				{selectedSpecieId ? (
					<FormField
						control={form.control}
						name="breedId"
						render={({ field }) => (
							<FormItem>
								<FormLabel>{t("breedLabel") + " *"}</FormLabel>
								<FormControl>
									<BreedSelect
										value={field.value}
										onChange={field.onChange}
										specieId={selectedSpecieId}
										defaultValue={field.value}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				) : null}
				<FormField
					control={form.control}
					name="groupName"
					render={({ field }) => {
						const { value, onChange, onBlur, name, ref } = field;
						return (
							<FormItem>
								<FormLabel>{t("groupNameLabel")}</FormLabel>
								<FormControl>
									<Input
										placeholder={t("groupNamePlaceholder")}
										value={value}
										onChange={onChange}
										onBlur={onBlur}
										name={name}
										ref={ref}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						);
					}}
				/>
				<FormField
					control={form.control}
					name="tagPrefix"
					render={({ field }) => {
						const { value, onChange, onBlur, name, ref } = field;
						return (
							<FormItem>
								<FormLabel>{t("tagPrefixLabel")}</FormLabel>
								<FormControl>
									<Input
										placeholder={t("tagPrefixPlaceholder")}
										value={value}
										onChange={onChange}
										onBlur={onBlur}
										name={name}
										ref={ref}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						);
					}}
				/>
				<FormField
					control={form.control}
					name="tagMode"
					render={({ field }) => (
						<FormItem>
							<FormLabel>{t("tagInputModeLabel")}</FormLabel>
							<FormControl>
								<RadioGroup
									value={field.value}
									onValueChange={field.onChange}
									className="flex gap-4"
									defaultValue="manual"
								>
									<div className="flex items-center gap-2">
										<RadioGroupItem
											value="manual"
											id="manual"
										/>
										<Label htmlFor="manual">{t("manualTagsLabel")}</Label>
									</div>
									<div className="flex items-center gap-2">
										<RadioGroupItem
											value="sequential"
											id="sequential"
										/>
										<Label htmlFor="sequential">
											{t("sequentialTagsLabel")}
										</Label>
									</div>
								</RadioGroup>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				{tagMode === "manual" && (
					<FormField
						control={form.control}
						name="tags"
						render={({ field }) => {
							const { value, onChange, onBlur, name, ref } = field;
							return (
								<FormItem>
									<FormLabel>{t("tagsLabel") + " *"}</FormLabel>
									<FormControl>
										<Input
											placeholder={t("tagsPlaceholder")}
											value={value}
											onChange={onChange}
											onBlur={onBlur}
											name={name}
											ref={ref}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							);
						}}
					/>
				)}
				{tagMode === "sequential" && (
					<div className="flex flex-col gap-2">
						<FormField
							control={form.control}
							name="count"
							render={({ field }) => {
								const { value, onChange, onBlur, name, ref } = field;
								return (
									<FormItem>
										<FormLabel>{t("quantityLabel")}</FormLabel>
										<FormControl>
											<Input
												type="number"
												min={1}
												max={100}
												value={typeof value === "number" ? value : ""}
												onChange={onChange}
												onBlur={onBlur}
												name={name}
												ref={ref}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								);
							}}
						/>

						<FormField
							control={form.control}
							name="tagStartNumber"
							render={({ field }) => {
								const { value, onChange, onBlur, name, ref } = field;
								return (
									<FormItem>
										<FormLabel>{t("tagStartingNumberLabel")}</FormLabel>
										<FormControl>
											<Input
												placeholder={t("tagStartingNumberPlaceholder")}
												value={typeof value === "number" ? value : ""}
												onChange={onChange}
												onBlur={onBlur}
												name={name}
												ref={ref}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								);
							}}
						/>
					</div>
				)}
				<div className="flex justify-around">
					<Button
						type="submit"
						disabled={isPending}
					>
						{t("createButton")}
					</Button>
					<Button
						type="button"
						onClick={closeDialog}
						className="bg-destructive"
					>
						{t("cancelButton")}
					</Button>
				</div>
				{bulkCreateResult ? (
					<div className="mt-2 rounded-md border p-3">
						<p className="text-sm font-medium">
							{t("resultSummary", {
								createdCount: bulkCreateResult.createdCount,
								failedCount: bulkCreateResult.failedCount,
							})}
						</p>
						{bulkCreateResult.failedCount > 0 ? (
							<div className="mt-2">
								<p className="text-sm font-medium">{t("failedItemsTitle")}</p>
								<div className="mt-2 max-h-40 overflow-y-auto rounded-md border">
									<div className="grid grid-cols-2 gap-2 border-b bg-muted px-3 py-2 text-xs font-semibold">
										<span>{t("failedTagNumberHeader")}</span>
										<span>{t("failedReasonHeader")}</span>
									</div>
									{bulkCreateResult.failedItems.map((item) => (
										<div
											className="grid grid-cols-2 gap-2 border-b px-3 py-2 text-xs last:border-b-0"
											key={`${item.tagNumber}-${item.reason}`}
										>
											<span>{item.tagNumber}</span>
											<span>{item.reason}</span>
										</div>
									))}
								</div>
							</div>
						) : null}
					</div>
				) : null}
			</form>
		</Form>
	);
};
