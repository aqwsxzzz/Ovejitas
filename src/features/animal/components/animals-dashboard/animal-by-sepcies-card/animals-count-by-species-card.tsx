import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import type { IAnimalsCountBySpeciesResponse } from "@/features/animal/types/animal-types";
import { Link, useParams } from "@tanstack/react-router";

interface AnimalCardProps {
	animal: IAnimalsCountBySpeciesResponse;
}

function getFarmAnimalEmoji(name: string): string {
	switch (name) {
		case "Cattle":
		case "Bovino":
			return "🐄";
		case "Pig":
		case "Porcino":
			return "🐷";
		case "Chicken":
			return "🐔";
		case "Sheep":
		case "Ovino":
			return "🐑";
		case "Horse":
			return "🐴";
		case "Goat":
		case "Caprino":
			return "🐐";
		case "Duck":
			return "🦆";
		case "Rooster":
			return "🐓";
		default:
			return "";
	}
}

export const AnimalCountBySpeciesCard = ({ animal }: AnimalCardProps) => {
	const { farmId } = useParams({ strict: false });

	return (
		<Card className="w-full max-w-3xl mx-auto my-2 px-3 py-2 rounded-md border border-border bg-background shadow-sm hover:shadow transition min-h-0">
			<div className="flex flex-row items-center gap-3 w-full">
				{/* Icon */}
				<div className="flex-none text-2xl flex items-center justify-center bg-muted rounded-md w-10 h-10">
					{getFarmAnimalEmoji(animal.species.name)}
				</div>

				{/* Species Name */}
				<h3 className="flex-1 font-medium text-base text-card-foreground truncate">
					{animal.species.name}
				</h3>

				{/* Quantity */}
				<p className="flex-none text-lg font-bold text-primary px-2">
					{animal.count}
				</p>

				{/* View Details Button */}
				<Link
					to="/farm/$farmId/species/$speciesId/animals"
					params={{ farmId: farmId!, speciesId: animal.species.id }}
				>
					<Button
						variant="outline"
						className="gap-2 h-8 px-3 text-xs bg-transparent flex-none"
					>
						<Eye className="h-3 w-3" />
						View Details
					</Button>
				</Link>
			</div>
		</Card>
	);
};
