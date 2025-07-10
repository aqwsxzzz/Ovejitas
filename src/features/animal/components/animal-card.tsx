import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import type { IAnimal } from "@/features/animal/types/animal-types";
import { Badge } from "@/components/ui/badge";
import { Link } from "@tanstack/react-router";
import { EditAnimalModal } from "@/features/animal/components/edit-animal-modal/edit-animal-modal";
import { DeleteAnimalModal } from "@/features/animal/components/delete-animal-modal/delete-animal-modal";

interface AnimalCardProps {
	animal: IAnimal;
}

export const AnimalCard = ({ animal }: AnimalCardProps) => {
	const getStatusColor = (status: IAnimal["status"]) => {
		switch (status) {
			case "alive":
				return "bg-green-500/10 text-green-700 hover:bg-green-500/20";
			case "deceased":
				return "bg-red-500/10 text-red-700 hover:bg-red-500/20";
			case "sold":
				return "bg-blue-500/10 text-blue-700 hover:bg-blue-500/20";
		}
	};

	return (
		<Link
			to="/farm/$farmId/$animalId/animal"
			params={{
				farmId: animal.farmId,
				animalId: animal.id,
			}}
			className="no-underline"
		>
			<Card className="border-2 p-2 flex flex-col gap-1 min-h-0 max-w-full">
				<CardHeader className="p-2 pb-0 flex flex-row items-center justify-between">
					<div>
						<CardTitle className="text-lg font-bold leading-tight">
							{animal.name}
						</CardTitle>
						<CardDescription className="text-xs leading-tight">
							Tag #{animal.tagNumber} • {animal.sex}
						</CardDescription>
					</div>
					<Badge
						variant="secondary"
						className={getStatusColor(animal.status)}
					>
						{animal.status}
					</Badge>
				</CardHeader>
				<CardContent className="p-2 pt-1 flex flex-row gap-2 justify-between items-center">
					<div className="flex gap-2">
						<Badge variant="secondary">{animal.reproductiveStatus}</Badge>
						<Badge variant="outline">{animal.acquisitionType}</Badge>
					</div>
					<div onClick={(e) => e.preventDefault()}>
						<EditAnimalModal animal={animal} />
						<DeleteAnimalModal animal={animal} />
					</div>
				</CardContent>
			</Card>
		</Link>
	);
};
