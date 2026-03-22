import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "react-i18next";
import i18next from "i18next";
import { SpecieSelect } from "@/features/specie/components/species-select";
import { BreedSelect } from "@/features/breed/components/breed-select";
import { useCreateFlock } from "@/features/flock/api/flock-queries";
import type { IFlockType } from "@/features/flock/types/flock-types";

interface CreateFlockFormProps {
	farmId: string;
	onSuccess: () => void;
}

const flockTypeOptions: IFlockType[] = [
	"layers",
	"broilers",
	"dual_purpose",
	"general",
];

const acquisitionTypeOptions = ["hatched", "purchased", "other"] as const;

export const CreateFlockForm = ({
	farmId,
	onSuccess,
}: CreateFlockFormProps) => {
	const { t } = useTranslation("flocks");
	const language = i18next.language.slice(0, 2) || "en";
	const { mutateAsync: createFlock, isPending } = useCreateFlock();

	const schema = z.object({
		name: z
			.string()
			.trim()
			.min(1, { message: t("validation.nameRequired") }),
		speciesId: z
			.string()
			.trim()
			.min(1, { message: t("validation.speciesRequired") }),
		breedId: z
			.string()
			.trim()
			.min(1, { message: t("validation.breedRequired") }),
		flockType: z.enum(["layers", "broilers", "dual_purpose", "general"]),
		initialCount: z.coerce
			.number()
			.int()
			.min(1, {
				message: t("validation.initialCountRequired"),
			}),
		startDate: z
			.string()
			.min(1, { message: t("validation.startDateRequired") }),
		acquisitionType: z.enum(["hatched", "purchased", "other"]),
		houseName: z.string().optional(),
		ageAtAcquisitionWeeks: z.string().optional(),
		notes: z.string().optional(),
	});

	const form = useForm<z.infer<typeof schema>>({
		resolver: zodResolver(schema),
		defaultValues: {
			name: "",
			speciesId: "",
			breedId: "",
			flockType: "layers",
			initialCount: 1,
			startDate: "",
			acquisitionType: "purchased",
			houseName: "",
			ageAtAcquisitionWeeks: "",
			notes: "",
		},
	});

	const selectedSpeciesId = form.watch("speciesId");

	const onSubmit = async (values: z.infer<typeof schema>) => {
		await createFlock({
			farmId,
			payload: {
				name: values.name,
				speciesId: values.speciesId,
				breedId: values.breedId,
				flockType: values.flockType,
				initialCount: values.initialCount,
				startDate: values.startDate,
				acquisitionType: values.acquisitionType,
				language,
				houseName: values.houseName?.trim() || undefined,
				notes: values.notes?.trim() || undefined,
				ageAtAcquisitionWeeks: values.ageAtAcquisitionWeeks
					? Number(values.ageAtAcquisitionWeeks)
					: undefined,
			},
		});

		onSuccess();
	};

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="flex flex-col gap-3"
			>
				<FormField
					control={form.control}
					name="name"
					render={({ field }) => (
						<FormItem>
							<FormLabel>{t("fields.name")}</FormLabel>
							<FormControl>
								<Input {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="speciesId"
					render={({ field }) => (
						<FormItem>
							<FormLabel>{t("fields.species")}</FormLabel>
							<FormControl>
								<SpecieSelect
									value={field.value}
									onChange={field.onChange}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				{selectedSpeciesId && (
					<FormField
						control={form.control}
						name="breedId"
						render={({ field }) => (
							<FormItem>
								<FormLabel>{t("fields.breed")}</FormLabel>
								<FormControl>
									<BreedSelect
										value={field.value}
										onChange={field.onChange}
										specieId={selectedSpeciesId}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				)}
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
					<FormField
						control={form.control}
						name="flockType"
						render={({ field }) => (
							<FormItem>
								<FormLabel>{t("fields.flockType")}</FormLabel>
								<FormControl>
									<select
										className="h-9 rounded-md border border-input bg-background px-2 text-sm w-full"
										value={field.value}
										onChange={field.onChange}
									>
										{flockTypeOptions.map((option) => (
											<option
												key={option}
												value={option}
											>
												{t(`flockType.${option}`)}
											</option>
										))}
									</select>
								</FormControl>
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="initialCount"
						render={({ field }) => (
							<FormItem>
								<FormLabel>{t("fields.initialCount")}</FormLabel>
								<FormControl>
									<Input
										type="number"
										min={1}
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
					<FormField
						control={form.control}
						name="startDate"
						render={({ field }) => (
							<FormItem>
								<FormLabel>{t("fields.startDate")}</FormLabel>
								<FormControl>
									<Input
										type="date"
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="acquisitionType"
						render={({ field }) => (
							<FormItem>
								<FormLabel>{t("fields.acquisitionType")}</FormLabel>
								<FormControl>
									<select
										className="h-9 rounded-md border border-input bg-background px-2 text-sm w-full"
										value={field.value}
										onChange={field.onChange}
									>
										{acquisitionTypeOptions.map((option) => (
											<option
												key={option}
												value={option}
											>
												{t(`acquisitionType.${option}`)}
											</option>
										))}
									</select>
								</FormControl>
							</FormItem>
						)}
					/>
				</div>
				<FormField
					control={form.control}
					name="houseName"
					render={({ field }) => (
						<FormItem>
							<FormLabel>{t("fields.houseName")}</FormLabel>
							<FormControl>
								<Input {...field} />
							</FormControl>
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="ageAtAcquisitionWeeks"
					render={({ field }) => (
						<FormItem>
							<FormLabel>{t("fields.ageAtAcquisitionWeeks")}</FormLabel>
							<FormControl>
								<Input
									type="number"
									min={0}
									{...field}
								/>
							</FormControl>
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="notes"
					render={({ field }) => (
						<FormItem>
							<FormLabel>{t("fields.notes")}</FormLabel>
							<FormControl>
								<Textarea {...field} />
							</FormControl>
						</FormItem>
					)}
				/>
				<Button
					type="submit"
					disabled={isPending}
				>
					{isPending ? t("page.saving") : t("page.save")}
				</Button>
			</form>
		</Form>
	);
};
