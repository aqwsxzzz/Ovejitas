import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import {
	useCreateExpense,
	useUpdateExpenseById,
} from "@/features/expense/api/expense-queries";
import { ExpenseFormEntityFields } from "@/features/expense/components/expense-form-entity-fields";
import { getExpenseFormDefaultValues } from "@/features/expense/components/expense-form-default-values";
import { ExpenseFormMainFields } from "@/features/expense/components/expense-form-main-fields";
import {
	expenseFormSchema,
	type ExpenseFormValues,
	toYyyyMmDd,
} from "@/features/expense/components/expense-form-schema";
import type {
	IExpense,
	IExpenseListFilters,
} from "@/features/expense/types/expense-types";
import { useGetSpecies } from "@/features/specie/api/specie.queries";
import { zodResolver } from "@hookform/resolvers/zod";
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
	type: values.type,
	description: values.description?.trim() || undefined,
	speciesId: values.speciesId,
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

	const form = useForm<ExpenseFormValues>({
		resolver: zodResolver(expenseFormSchema),
		defaultValues: getExpenseFormDefaultValues(expense),
	});

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
				<ExpenseFormEntityFields
					form={form}
					speciesData={speciesData}
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
