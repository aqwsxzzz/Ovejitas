import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { IExpenseListFilters } from "@/features/expense/types/expense-types";
import { Filter } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ExpenseFilterFABProps {
	filters: Partial<IExpenseListFilters>;
	onOpen: () => void;
}

export const ExpenseFilterFAB = ({
	filters,
	onOpen,
}: ExpenseFilterFABProps) => {
	const { t } = useTranslation("expenses");
	const activeFilterCount = Object.values(filters).filter(
		(v) => v !== undefined,
	).length;

	return (
		<div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-40 md:hidden">
			<Button
				onClick={onOpen}
				variant={activeFilterCount > 0 ? "default" : "outline"}
				className="rounded-full px-4 py-2 h-10 gap-2 whitespace-nowrap"
			>
				<Filter className="h-4 w-4" />
				<span className="text-sm font-medium">
					{t("filters.button", "Filters")}
				</span>
				{activeFilterCount > 0 && (
					<Badge
						variant="secondary"
						className="ml-1 h-5 min-w-5 rounded-full px-1.5 text-xs"
					>
						{activeFilterCount}
					</Badge>
				)}
			</Button>
		</div>
	);
};
