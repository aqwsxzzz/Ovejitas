import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type { IAnimal } from "@/features/animal/types/animal-types";
import { getBreedDisplayName, type Breed } from "@/features/breed/types/breed";
import type { ExpenseFormValues } from "@/features/expense/components/expense-form-schema";
import type { ISpecie } from "@/features/specie/types/specie-types";
import type { UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";

interface ExpenseFormEntityFieldsProps {
	form: UseFormReturn<ExpenseFormValues>;
	speciesData: ISpecie[];
	breedData: Breed[];
	filteredAnimals: IAnimal[];
	selectedSpeciesId: string;
	lotOptions: string[];
}

export const ExpenseFormEntityFields = ({
	form,
	speciesData,
	breedData,
	filteredAnimals,
	selectedSpeciesId,
	lotOptions,
}: ExpenseFormEntityFieldsProps) => {
	const { t, i18n } = useTranslation("expenses");
	const language = i18n.language.slice(0, 2);

	return (
		<details className="border rounded-card p-3">
			<summary className="cursor-pointer text-sm font-medium">
				{t("form.sections.farmContext")}
			</summary>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
				<FormField
					control={form.control}
					name="speciesId"
					render={({ field }) => (
						<FormItem>
							<FormLabel>{t("form.fields.species")}</FormLabel>
							<FormControl>
								<Select
									value={field.value ?? "none"}
									onValueChange={(value) => {
										const nextSpeciesId = value === "none" ? undefined : value;
										field.onChange(nextSpeciesId);
										form.setValue("breedId", undefined);
										form.setValue("animalId", undefined);
									}}
								>
									<SelectTrigger className="w-full">
										<SelectValue
											placeholder={t("form.placeholders.optional")}
										/>
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="none">
											{t("form.placeholders.none")}
										</SelectItem>
										{speciesData
											.filter((specie) => specie.translations?.[0]?.name)
											.map((specie) => (
												<SelectItem
													key={specie.id}
													value={specie.id}
												>
													{specie.translations?.[0]?.name}
												</SelectItem>
											))}
									</SelectContent>
								</Select>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="breedId"
					render={({ field }) => (
						<FormItem>
							<FormLabel>{t("form.fields.breed")}</FormLabel>
							<FormControl>
								<Select
									value={field.value ?? "none"}
									onValueChange={(value) =>
										field.onChange(value === "none" ? undefined : value)
									}
								>
									<SelectTrigger className="w-full">
										<SelectValue
											placeholder={
												selectedSpeciesId
													? t("form.placeholders.optional")
													: t("form.placeholders.selectSpeciesFirst")
											}
										/>
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="none">
											{t("form.placeholders.none")}
										</SelectItem>
										{breedData.map((breed) => (
											<SelectItem
												key={breed.id}
												value={breed.id}
											>
												{getBreedDisplayName(breed, language)}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="animalId"
					render={({ field }) => (
						<FormItem>
							<FormLabel>{t("form.fields.animal")}</FormLabel>
							<FormControl>
								<Select
									value={field.value ?? "none"}
									onValueChange={(value) =>
										field.onChange(value === "none" ? undefined : value)
									}
								>
									<SelectTrigger className="w-full">
										<SelectValue
											placeholder={t("form.placeholders.optional")}
										/>
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="none">
											{t("form.placeholders.none")}
										</SelectItem>
										{filteredAnimals.map((animal) => (
											<SelectItem
												key={animal.id}
												value={animal.id}
											>
												{animal.name || animal.tagNumber}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="lotId"
					render={({ field }) => (
						<FormItem>
							<FormLabel>{t("form.fields.lotId")}</FormLabel>
							<FormControl>
								<Select
									value={field.value ?? "none"}
									onValueChange={(value) =>
										field.onChange(value === "none" ? undefined : value)
									}
								>
									<SelectTrigger className="w-full">
										<SelectValue
											placeholder={t("form.placeholders.optional")}
										/>
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="none">
											{t("form.placeholders.none")}
										</SelectItem>
										{lotOptions.length === 0 && (
											<SelectItem
												value="no-lots"
												disabled
											>
												{t("form.placeholders.noLots")}
											</SelectItem>
										)}
										{lotOptions.map((lotId) => (
											<SelectItem
												key={lotId}
												value={lotId}
											>
												{lotId}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
			</div>
		</details>
	);
};
