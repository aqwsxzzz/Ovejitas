import { Badge } from "@/components/ui/badge";
import type {
	ExpenseCategory,
	ExpenseStatus,
} from "@/features/expense/types/expense-types";
import {
	expenseCategoryLabelKeys,
	expenseStatusLabelKeys,
} from "./expense-labels";
import { useTranslation } from "react-i18next";

const statusVariantByKey: Record<
	ExpenseStatus,
	"warning" | "success" | "info"
> = {
	pending: "warning",
	paid: "success",
	reimbursed: "info",
};

export const ExpenseStatusBadge = ({ status }: { status: ExpenseStatus }) => {
	const { t } = useTranslation("expenses");

	return (
		<Badge variant={statusVariantByKey[status]}>
			{t(expenseStatusLabelKeys[status] as never)}
		</Badge>
	);
};

export const ExpenseCategoryBadge = ({
	category,
}: {
	category: ExpenseCategory;
}) => {
	const { t } = useTranslation("expenses");

	return (
		<Badge variant="secondary">
			{t(expenseCategoryLabelKeys[category] as never)}
		</Badge>
	);
};
