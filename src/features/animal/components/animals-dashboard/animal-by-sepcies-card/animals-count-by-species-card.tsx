import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";
import type { IAnimalsCountBySpeciesResponse } from "@/features/animal/types/animal-types";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

interface AnimalCardProps {
	animal: IAnimalsCountBySpeciesResponse;
	attentionCount: number;
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

export const AnimalCountBySpeciesCard = ({
	animal,
	attentionCount,
}: AnimalCardProps) => {
	const { t } = useTranslation("animalsCountBySpeciesCard");

	return (
		<Card className="w-full max-w-3xl mx-auto my-2 px-3 rounded-md border border-border bg-background shadow-sm hover:shadow transition">
			<div className="flex flex-row items-center gap-2 sm:gap-3 w-full h-14">
				{/* Icon */}
				<div className="flex-none text-2xl flex items-center justify-center bg-muted rounded-md w-10 h-10">
					{getFarmAnimalEmoji(animal.species.name)}
				</div>

				{/* Species Name */}
				<h3 className="flex-1 min-w-0 font-medium text-base text-card-foreground truncate hidden sm:block">
					{animal.species.name}
				</h3>

				{/* Quantity */}
				<div className="flex-none w-[3ch] text-center">
					<p className="text-lg font-bold text-primary leading-none tabular-nums">
						{animal.count}
					</p>
				</div>

				<div className="flex-1 min-w-0 flex justify-center sm:flex-none sm:w-[10.5rem]">
					<Badge
						className="w-[9.25rem] sm:w-full justify-center"
						variant={attentionCount > 0 ? "warning" : "success"}
					>
						{attentionCount > 0
							? t("needsAttention", { count: attentionCount })
							: t("allHealthy")}
					</Badge>
				</div>

				{/* View Details Button */}
				<Link
					className="flex-none flex items-center"
					to="/v2/production-units"
				>
					<Button
						variant="outline"
						className="gap-1.5 h-8 px-1.5 sm:px-3 text-xs bg-transparent"
					>
						<Eye className="h-3 w-3 flex-none" />
						<span className="hidden sm:inline">{t("viewDetailsButton")}</span>
					</Button>
				</Link>
			</div>
		</Card>
	);
};
