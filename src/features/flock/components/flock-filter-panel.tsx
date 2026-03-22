import type {
	IFlockListFilters,
	IFlockStatus,
	IFlockType,
} from "@/features/flock/types/flock-types";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface FilterOptionProps {
	label: string;
	selected: boolean;
	onClick: () => void;
}

interface FlockFilterPanelProps {
	filters: Partial<IFlockListFilters>;
	onStatusChange: (nextStatus: string) => void;
	onFlockTypeChange: (nextFlockType: string) => void;
}

const FilterOption = ({ label, selected, onClick }: FilterOptionProps) => (
	<button
		type="button"
		onClick={onClick}
		className="flex items-center gap-3 text-left text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
	>
		<span
			className={cn(
				"flex h-4 w-4 items-center justify-center rounded-full border border-border bg-background",
				selected && "border-primary border-[5px]",
			)}
		/>
		<span>{label}</span>
	</button>
);

export const FlockFilterPanel = ({
	filters,
	onStatusChange,
	onFlockTypeChange,
}: FlockFilterPanelProps) => {
	const { t } = useTranslation("flocks");

	return (
		<div className="rounded-[24px] border border-border/70 bg-card p-5 shadow-md">
			<div className="space-y-4 border-b border-border/60 pb-5">
				<p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
					{t("filters.statusTitle")}
				</p>
				<div className="space-y-3">
					<FilterOption
						label={t("filters.allStatuses")}
						selected={!filters.status}
						onClick={() => onStatusChange("all")}
					/>
					<FilterOption
						label={t("status.active")}
						selected={filters.status === ("active" as IFlockStatus)}
						onClick={() => onStatusChange("active")}
					/>
					<FilterOption
						label={t("status.completed")}
						selected={filters.status === ("completed" as IFlockStatus)}
						onClick={() => onStatusChange("completed")}
					/>
				</div>
			</div>
			<div className="space-y-4 pt-5">
				<p className="text-xs font-bold uppercase tracking-[0.2em] text-foreground/70">
					{t("filters.typeTitle")}
				</p>
				<div className="space-y-3">
					<FilterOption
						label={t("filters.allTypes")}
						selected={!filters.flockType}
						onClick={() => onFlockTypeChange("all")}
					/>
					<FilterOption
						label={t("flockType.layers")}
						selected={filters.flockType === ("layers" as IFlockType)}
						onClick={() => onFlockTypeChange("layers")}
					/>
					<FilterOption
						label={t("flockType.broilers")}
						selected={filters.flockType === ("broilers" as IFlockType)}
						onClick={() => onFlockTypeChange("broilers")}
					/>
				</div>
			</div>
		</div>
	);
};
