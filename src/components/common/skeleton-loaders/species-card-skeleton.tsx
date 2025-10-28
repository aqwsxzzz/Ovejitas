import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const SpeciesCardSkeleton = () => {
	return (
		<Card className="w-full max-w-3xl mx-auto my-2 px-3 py-2 rounded-md border border-border bg-background shadow-sm">
			<div className="flex flex-row items-center gap-3 w-full">
				{/* Icon */}
				<Skeleton className="flex-none w-10 h-10 rounded-md" />

				{/* Species Name */}
				<Skeleton className="flex-1 h-5" />

				{/* Quantity */}
				<Skeleton className="flex-none h-6 w-8" />

				{/* View Details Button */}
				<Skeleton className="h-8 w-24 rounded-lg" />
			</div>
		</Card>
	);
};

export const SpeciesCardSkeletonList = ({ count = 3 }: { count?: number }) => {
	return (
		<div className="flex flex-col gap-1 sm:gap-2 w-full">
			{Array.from({ length: count }).map((_, index) => (
				<SpeciesCardSkeleton key={index} />
			))}
		</div>
	);
};
