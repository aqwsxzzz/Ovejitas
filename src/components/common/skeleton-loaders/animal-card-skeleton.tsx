import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const AnimalCardSkeleton = () => {
	return (
		<Card className="border-2 p-2 flex flex-col gap-1 min-h-0 max-w-full">
			<CardHeader className="p-2 pb-0 flex flex-row items-center justify-between">
				<div className="flex items-center gap-2 flex-1">
					<Skeleton className="h-2 w-2 rounded-full" />
					<div className="flex-1">
						<Skeleton className="h-5 w-32 mb-2" />
						<Skeleton className="h-4 w-24" />
					</div>
				</div>
				<Skeleton className="h-6 w-16 rounded-lg" />
			</CardHeader>
			<CardContent className="p-2 pt-1 flex flex-row gap-2 justify-between items-center">
				<div className="flex gap-2">
					<Skeleton className="h-6 w-20 rounded-lg" />
					<Skeleton className="h-6 w-20 rounded-lg" />
				</div>
				<div className="flex gap-2">
					<Skeleton className="h-8 w-8 rounded-lg" />
					<Skeleton className="h-8 w-8 rounded-lg" />
				</div>
			</CardContent>
		</Card>
	);
};

export const AnimalCardSkeletonList = ({ count = 3 }: { count?: number }) => {
	return (
		<div className="text-sidebar flex flex-col gap-2">
			{Array.from({ length: count }).map((_, index) => (
				<AnimalCardSkeleton key={index} />
			))}
		</div>
	);
};
