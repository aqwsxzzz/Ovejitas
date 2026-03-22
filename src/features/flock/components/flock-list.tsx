import { FlockCard } from "@/features/flock/components/flock-card";
import type { IFlock } from "@/features/flock/types/flock-types";
import { cn } from "@/lib/utils";

interface FlockListProps {
	flocks: IFlock[];
	className?: string;
}

export const FlockList = ({ flocks, className }: FlockListProps) => {
	return (
		<div className={cn("flex flex-col gap-3", className)}>
			{flocks.map((flock) => (
				<FlockCard
					key={flock.id}
					flock={flock}
				/>
			))}
		</div>
	);
};
