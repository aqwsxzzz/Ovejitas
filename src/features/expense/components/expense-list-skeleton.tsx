import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const ExpenseItemSkeleton = () => {
	return (
		<Card className="py-4">
			<CardContent className="px-4 md:px-6 flex flex-col gap-3">
				<div className="flex items-start justify-between gap-3">
					<div className="flex flex-col gap-2 flex-1">
						<div className="flex items-center gap-2">
							<Skeleton className="h-6 w-24 rounded-lg" />
							<Skeleton className="h-6 w-20 rounded-lg" />
						</div>
						<Skeleton className="h-4 w-28" />
						<Skeleton className="h-6 w-32" />
					</div>
					<div className="flex gap-2">
						<Skeleton className="h-10 w-10 rounded-lg" />
						<Skeleton className="h-10 w-10 rounded-lg" />
					</div>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-2">
					<Skeleton className="h-12 w-full" />
					<Skeleton className="h-12 w-full" />
					<Skeleton className="h-12 w-full" />
				</div>
			</CardContent>
		</Card>
	);
};

export const ExpenseListSkeleton = ({ count = 4 }: { count?: number }) => {
	return (
		<div className="flex flex-col gap-3">
			<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
				{Array.from({ length: 3 }).map((_, index) => (
					<Card
						key={`summary-${index}`}
						className="py-3"
					>
						<CardContent className="px-4 flex flex-col gap-2">
							<Skeleton className="h-4 w-20" />
							<Skeleton className="h-6 w-28" />
						</CardContent>
					</Card>
				))}
			</div>
			{Array.from({ length: count }).map((_, index) => (
				<ExpenseItemSkeleton key={`expense-${index}`} />
			))}
		</div>
	);
};
