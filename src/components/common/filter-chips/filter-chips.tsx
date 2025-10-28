import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export type FilterOption = {
	label: string;
	value: string;
	count?: number;
};

interface FilterChipsProps {
	options: FilterOption[];
	selected: string;
	onSelect: (value: string) => void;
	className?: string;
}

export const FilterChips = ({
	options,
	selected,
	onSelect,
	className,
}: FilterChipsProps) => {
	return (
		<div className={cn("flex gap-2 overflow-x-auto pb-2", className)}>
			{options.map((option) => (
				<button
					key={option.value}
					onClick={() => onSelect(option.value)}
					className={cn(
						"flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap",
						"border border-border",
						selected === option.value
							? "bg-primary text-primary-foreground shadow-sm"
							: "bg-background text-foreground hover:bg-muted",
					)}
				>
					{option.label}
					{option.count !== undefined && (
						<Badge
							variant="secondary"
							className={cn(
								"ml-1 h-5 min-w-5 rounded-full px-1.5 text-xs",
								selected === option.value
									? "bg-primary-foreground/20 text-primary-foreground"
									: "bg-muted text-muted-foreground",
							)}
						>
							{option.count}
						</Badge>
					)}
				</button>
			))}
		</div>
	);
};
