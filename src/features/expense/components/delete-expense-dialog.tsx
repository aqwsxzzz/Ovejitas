import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { useDeleteExpenseById } from "@/features/expense/api/expense-queries";
import type {
	IExpense,
	IExpenseListFilters,
} from "@/features/expense/types/expense-types";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

interface DeleteExpenseDialogProps {
	expense: IExpense;
	farmId: string;
	filters: Partial<IExpenseListFilters>;
}

export const DeleteExpenseDialog = ({
	expense,
	farmId,
	filters,
}: DeleteExpenseDialogProps) => {
	const [open, setOpen] = useState(false);
	const { t } = useTranslation("expenses");
	const { mutateAsync: deleteExpense, isPending } = useDeleteExpenseById();

	const onDelete = async () => {
		const response = await deleteExpense({
			expenseId: expense.id,
			farmId,
			filters,
		});
		if (response.status === "success") {
			setOpen(false);
		}
	};

	return (
		<Dialog
			open={open}
			onOpenChange={setOpen}
		>
			<DialogTrigger asChild>
				<Button
					variant="outline"
					className="border-destructive text-destructive"
				>
					<Trash2 className="h-4 w-4" />
				</Button>
			</DialogTrigger>
			<DialogContent className="max-w-80">
				<DialogTitle>{t("deleteDialog.title")}</DialogTitle>
				<DialogDescription>{t("deleteDialog.description")}</DialogDescription>
				<p className="text-sm text-muted-foreground">
					{expense.description || t("list.noDescription")}
				</p>
				<div className="flex justify-end gap-2 mt-2">
					<Button
						variant="outline"
						onClick={() => setOpen(false)}
					>
						{t("deleteDialog.cancel")}
					</Button>
					<Button
						className="bg-destructive"
						onClick={onDelete}
						disabled={isPending}
					>
						{t("deleteDialog.confirm")}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
};
