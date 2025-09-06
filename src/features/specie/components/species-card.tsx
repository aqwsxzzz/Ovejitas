import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

interface Animal {
	id: string;
	name: string;
	emoji: string;
	count: number;
}

interface AnimalCardProps {
	animal: Animal;
}

export function AnimalCard({ animal }: AnimalCardProps) {
	return (
		<Card className="hover:shadow-md transition-shadow duration-200 active:scale-[0.98]">
			<CardContent className="p-6 flex flex-col items-center text-center space-y-4">
				{/* Icon */}
				<div className="text-4xl mb-2">{animal.emoji}</div>

				{/* Species Name */}
				<h3 className="font-semibold text-lg text-card-foreground">
					{animal.name}
				</h3>

				{/* Quantity */}
				<p className="text-2xl font-bold text-primary">{animal.count}</p>
				<p className="text-sm text-muted-foreground -mt-2">animals</p>

				{/* View Details Button */}
				<Button
					variant="outline"
					className="w-full gap-2 mt-4 h-10 bg-transparent"
				>
					<Eye className="h-4 w-4" />
					View Details
				</Button>
			</CardContent>
		</Card>
	);
}
