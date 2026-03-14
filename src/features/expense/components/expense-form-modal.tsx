import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { ExpenseForm } from "./expense-form";
import type {
	IExpense,
	IExpenseListFilters,
} from "@/features/expense/types/expense-types";
import { Plus, Pencil } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

interface ExpenseFormModalProps {
	farmId: string;
	filters: Partial<IExpenseListFilters>;
	expense?: IExpense;
}

export const ExpenseFormModal = ({
	farmId,
	filters,
	expense,
}: ExpenseFormModalProps) => {
	const [open, setOpen] = useState(false);
	const { t } = useTranslation("expenses");

	return (
		<Dialog
			open={open}
			onOpenChange={setOpen}
		>
			<DialogTrigger asChild>
				{expense ? (
					<Button
						variant="outline"
						size="icon"
					>
						<Pencil className="h-4 w-4" />
					</Button>
				) : (
					<Button>
						<Plus className="h-4 w-4" />
						{t("modal.newButton")}
					</Button>
				)}
			</DialogTrigger>
			<DialogContent className="max-h-[90vh] overflow-y-auto p-4">
				<DialogTitle>
					{expense ? t("modal.editTitle") : t("modal.newTitle")}
				</DialogTitle>
				<DialogDescription>
					{expense ? t("modal.editDescription") : t("modal.newDescription")}
				</DialogDescription>
				<ExpenseForm
					farmId={farmId}
					filters={filters}
					expense={expense}
					onSuccess={() => setOpen(false)}
				/>
			</DialogContent>
		</Dialog>
	);
};
