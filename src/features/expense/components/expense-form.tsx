import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useGetAnimalsByFarmId } from "@/features/animal/api/animal-queries";
import { useGetBreedsBySpeciesId } from "@/features/breed/api/breed-queries";
import {
	useGetExpenses,
	useCreateExpense,
	useUpdateExpenseById,
} from "@/features/expense/api/expense-queries";
import { ExpenseFormEntityFields } from "@/features/expense/components/expense-form-entity-fields";
import { getExpenseFormDefaultValues } from "@/features/expense/components/expense-form-default-values";
import { ExpenseFormMainFields } from "@/features/expense/components/expense-form-main-fields";
import { ExpenseFormQuantityFields } from "@/features/expense/components/expense-form-quantity-fields";
import {
	expenseFormSchema,
	type ExpenseFormValues,
	parseOptionalNumber,
	toYyyyMmDd,
} from "@/features/expense/components/expense-form-schema";
import type {
	IExpense,
	IExpenseListFilters,
} from "@/features/expense/types/expense-types";
import { normalizeQuantityUnit } from "@/features/expense/types/expense-types";
import { useGetSpecies } from "@/features/specie/api/specie.queries";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

interface ExpenseFormProps {
	expense?: IExpense;
	farmId: string;
	filters: Partial<IExpenseListFilters>;
	onSuccess: () => void;
}

const createExpensePayload = (values: ExpenseFormValues) => ({
	date: toYyyyMmDd(values.date),
	amount: Number(values.amount),
	category: values.category,
	description: values.description?.trim() || undefined,
	vendor: values.vendor?.trim() || undefined,
	invoiceNumber: values.invoiceNumber?.trim() || undefined,
	paymentMethod: values.paymentMethod,
	status: values.status,
	quantity: parseOptionalNumber(values.quantity),
	quantityUnit: normalizeQuantityUnit(values.quantityUnit) ?? "other",
	unitCost: parseOptionalNumber(values.unitCost),
	speciesId: values.speciesId || undefined,
	breedId: values.breedId || undefined,
	animalId: values.animalId || undefined,
	lotId: values.lotId?.trim() || undefined,
});

export const ExpenseForm = ({
	expense,
	farmId,
	filters,
	onSuccess,
}: ExpenseFormProps) => {
	const { t } = useTranslation("expenses");

	const { mutateAsync: createExpense, isPending: isCreating } =
		useCreateExpense();
	const { mutateAsync: updateExpense, isPending: isUpdating } =
		useUpdateExpenseById();
	const { data: speciesData = [] } = useGetSpecies({
		include: "",
		withLanguage: true,
	});
	const { data: animalData = [] } = useGetAnimalsByFarmId({
		farmId,
		withLanguage: true,
	});
	const { data: expenseData = [] } = useGetExpenses({ farmId });

	const form = useForm<ExpenseFormValues>({
		resolver: zodResolver(expenseFormSchema),
		defaultValues: getExpenseFormDefaultValues(expense),
	});

	const selectedSpeciesId = form.watch("speciesId") ?? "";
	const selectedQuantity = form.watch("quantity");
	const selectedUnitCost = form.watch("unitCost");
	const { data: breedData = [] } = useGetBreedsBySpeciesId(selectedSpeciesId);

	const filteredAnimals = useMemo(
		() =>
			selectedSpeciesId
				? animalData.filter((animal) => animal.speciesId === selectedSpeciesId)
				: animalData,
		[animalData, selectedSpeciesId],
	);

	const lotOptions = useMemo(
		() =>
			Array.from(
				new Set(expenseData.map((item) => item.lotId).filter(Boolean)),
			) as string[],
		[expenseData],
	);

	const onQuantityRelatedChange = (
		nextQuantity?: string,
		nextUnitCost?: string,
	) => {
		const quantity = parseOptionalNumber(nextQuantity);
		const unitCost = parseOptionalNumber(nextUnitCost);
		if (quantity === undefined || unitCost === undefined) {
			return;
		}

		form.setValue("amount", (quantity * unitCost).toFixed(2), {
			shouldValidate: true,
			shouldDirty: true,
		});
	};

	const onSubmit = async (values: ExpenseFormValues) => {
		const payload = createExpensePayload(values);
		const response = expense
			? await updateExpense({ expenseId: expense.id, payload, farmId, filters })
			: await createExpense({ payload, farmId, filters });

		if (response.status === "success") {
			onSuccess();
		}
	};

	return (
		<Form {...form}>
			<form
				className="flex flex-col gap-3"
				onSubmit={form.handleSubmit(onSubmit)}
			>
				<ExpenseFormMainFields form={form} />
				<ExpenseFormQuantityFields
					form={form}
					selectedQuantity={selectedQuantity}
					selectedUnitCost={selectedUnitCost}
					onQuantityRelatedChange={onQuantityRelatedChange}
				/>
				<ExpenseFormEntityFields
					form={form}
					speciesData={speciesData}
					breedData={breedData}
					filteredAnimals={filteredAnimals}
					selectedSpeciesId={selectedSpeciesId}
					lotOptions={lotOptions}
				/>
				<div className="flex justify-end gap-2 pt-2">
					<Button
						type="button"
						variant="outline"
						onClick={onSuccess}
					>
						{t("form.actions.cancel")}
					</Button>
					<Button
						type="submit"
						disabled={isCreating || isUpdating}
					>
						{expense ? t("form.actions.save") : t("form.actions.create")}
					</Button>
				</div>
			</form>
		</Form>
	);
};
