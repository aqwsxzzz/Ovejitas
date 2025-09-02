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
import { useForm, type Resolver } from "react-hook-form";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { SpecieSelect } from "@/features/specie/components/specie-select";
import { BreedSelect } from "@/features/breed/components/breed-select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useCreateAnimalBulk } from "@/features/animal/api/animal-queries";
import { useParams } from "@tanstack/react-router";

const formSchema = z
	.object({
		specieId: z.string(),
		breedId: z.string(),
		groupName: z.string().optional(),
		count: z
			.string()
			.transform((val) => (val === "" ? undefined : Number(val)))
			.pipe(
				z
					.number()
					.int()
					.min(1, { message: "Quantity must be at least 1" })
					.max(100, { message: "Quantity too large" })
					.optional(),
			),
		tagPrefix: z.string().optional(),
		tagMode: z.enum(["manual", "sequential"]),
		tags: z.preprocess((val: unknown) => {
			if (typeof val === "string") {
				return val.trim() === ""
					? []
					: val
							.trim()
							.split(/[,\s]+/)
							.filter(Boolean);
			}
			if (Array.isArray(val)) return val;
			return [];
		}, z.array(z.string())),
		tagStartNumber: z
			.string()
			.transform((val) => (val === "" ? null : Number(val)))
			.pipe(z.number().nullable()),
	})
	.superRefine((data, ctx) => {
		if (
			data.tagMode === "manual" &&
			(!data.tags || (Array.isArray(data.tags) && data.tags.length === 0))
		) {
			ctx.addIssue({
				code: "custom",
				path: ["tags"],
				message: "Tags are required in manual mode.",
			});
		}

		if (data.tagMode === "sequential") {
			if (!data.tagStartNumber) {
				ctx.addIssue({
					code: "custom",
					path: ["tagStartNumber"],
					message: "Tag start number is required in sequential mode.",
				});
			}
			if (!data.count) {
				ctx.addIssue({
					code: "custom",
					path: ["count"],
					message: "Count is required in sequential mode.",
				});
			}
		}
	});

export const NewAnimalBulkForm = ({
	closeDialog,
}: {
	closeDialog: () => void;
}) => {
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema) as unknown as Resolver<
			z.infer<typeof formSchema>
		>,
		defaultValues: {
			specieId: "",
			breedId: "",
			groupName: "",
			count: 1,
			tagPrefix: "",
			tagMode: "manual",
			tags: [],
			tagStartNumber: null,
		},
	});

	const selectedSpecieId = form.watch("specieId");
	const tagMode = form.watch("tagMode");

	const { mutateAsync: createAnimalBulk, isPending } = useCreateAnimalBulk();
	const { farmId } = useParams({ strict: false });
	const onSubmit = async (data: z.infer<typeof formSchema>) => {
		if (tagMode === "manual") {
			const response = await createAnimalBulk({
				payload: {
					speciesId: data.specieId,
					breedId: data.breedId,
					groupName: data.groupName ?? null,
					tagPrefix: data.tagPrefix ?? null,
					tags: data.tags ?? null,
				},
				farmId: farmId!,
			});
			if (response.status === "success") {
				closeDialog();
			}
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
			});
			if (response.status === "success") {
				closeDialog();
			}
		}
		closeDialog();
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
							<FormLabel>Specie</FormLabel>
							<FormControl>
								<SpecieSelect
									value={field.value}
									onChange={field.onChange}
									defaultValue={field.value}
								/>
							</FormControl>
						</FormItem>
					)}
				/>
				{selectedSpecieId ? (
					<FormField
						control={form.control}
						name="breedId"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Breed</FormLabel>
								<FormControl>
									<BreedSelect
										value={field.value}
										onChange={field.onChange}
										specieId={selectedSpecieId}
										defaultValue={field.value}
									/>
								</FormControl>
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
								<FormLabel>Group Name</FormLabel>
								<FormControl>
									<Input
										placeholder="Enter a group name"
										value={value}
										onChange={onChange}
										onBlur={onBlur}
										name={name}
										ref={ref}
									/>
								</FormControl>
							</FormItem>
						);
					}}
				/>
				<FormField
					control={form.control}
					name="count"
					render={({ field }) => {
						const { value, onChange, onBlur, name, ref } = field;
						return (
							<FormItem>
								<FormLabel>Quantity</FormLabel>
								<FormControl>
									<Input
										type="number"
										min={1}
										max={100}
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
								<FormLabel>Tag Prefix (optional)</FormLabel>
								<FormControl>
									<Input
										placeholder="Prefix for tags (e.g. A-)"
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
							<FormLabel>Tag Input Mode</FormLabel>
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
										<Label htmlFor="manual">Manual tags</Label>
									</div>
									<div className="flex items-center gap-2">
										<RadioGroupItem
											value="sequential"
											id="sequential"
										/>
										<Label htmlFor="sequential">Sequential tags</Label>
									</div>
								</RadioGroup>
							</FormControl>
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
									<FormLabel>Tags (comma or newline separated)</FormLabel>
									<FormControl>
										<Input
											placeholder="Enter tags separated by comma or newline"
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
					<FormField
						control={form.control}
						name="tagStartNumber"
						render={({ field }) => {
							const { value, onChange, onBlur, name, ref } = field;
							return (
								<FormItem>
									<FormLabel>Tag Start Number</FormLabel>
									<FormControl>
										<Input
											placeholder="Starting number for tags (e.g. 1001)"
											value={value ?? ""}
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
				<div className="flex justify-around">
					<Button
						type="submit"
						disabled={isPending}
					>
						Create
					</Button>
					<Button
						onClick={closeDialog}
						className="bg-destructive"
					>
						Cancel
					</Button>
				</div>
			</form>
		</Form>
	);
};
