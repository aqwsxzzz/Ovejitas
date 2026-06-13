import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
				<Button
					key={option.value}
					variant={selected === option.value ? "default" : "outline"}
					onClick={() => onSelect(option.value)}
					className="gap-1 whitespace-nowrap"
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
				</Button>
			))}
		</div>
	);
};
