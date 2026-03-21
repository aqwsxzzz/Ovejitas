import { FlockCard } from "@/features/flock/components/flock-card";
import type { IFlock } from "@/features/flock/types/flock-types";

interface FlockListProps {
	flocks: IFlock[];
}

export const FlockList = ({ flocks }: FlockListProps) => {
	return (
		<div className="flex flex-col gap-3">
			{flocks.map((flock) => (
				<FlockCard
					key={flock.id}
					flock={flock}
				/>
			))}
		</div>
	);
};
