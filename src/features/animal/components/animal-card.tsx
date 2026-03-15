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
import { useTranslation } from "react-i18next";
import { useParams } from "@tanstack/react-router";
import { HealthStatusIndicator } from "@/components/common/health-status-indicator";

interface AnimalCardProps {
	animal: IAnimal;
	sex: IAnimal["sex"] | "";
}

export const AnimalCard = ({ animal, sex }: AnimalCardProps) => {
	const { t } = useTranslation("animalCard");
	const { farmId, speciesId } = useParams({ strict: false });

	const getStatusVariant = (
		status: IAnimal["status"],
	): "success" | "error" | "info" | "secondary" => {
		switch (status) {
			case "alive":
				return "success";
			case "deceased":
				return "error";
			case "sold":
				return "info";
			default:
				return "secondary";
		}
	};

	return (
		<Link
			to="/farm/$farmId/species/$speciesId/$animalId/animal"
			params={{
				farmId: farmId!,
				animalId: animal.id,
				speciesId: speciesId!,
			}}
			className="no-underline"
		>
			<Card className="border-2 p-2 flex flex-col gap-1 min-h-0 max-w-full">
				<CardHeader className="p-2 pb-0 flex flex-row items-center justify-between">
					<div className="flex items-center gap-2">
						<HealthStatusIndicator status={animal.status} />
						<div>
							<CardTitle className="text-lg font-bold leading-tight">
								{animal.name}
							</CardTitle>
							<CardDescription className="text-xs leading-tight">
								{t("tagText")} {animal.tagNumber} • {animal.sex}
							</CardDescription>
						</div>
					</div>
					<Badge variant={getStatusVariant(animal.status)}>
						{t(`statusOptions.${animal.status ?? "unknown"}`)}
					</Badge>
				</CardHeader>
				<CardContent className="p-2 pt-1 flex flex-row gap-2 justify-between items-center">
					<div className="flex gap-2">
						<Badge variant="secondary">{animal.reproductiveStatus}</Badge>
						<Badge variant="outline">{animal.acquisitionType}</Badge>
					</div>
					<div onClick={(e) => e.preventDefault()}>
						<EditAnimalModal animal={animal} />
						<DeleteAnimalModal
							animal={animal}
							sex={sex}
							speciesId={speciesId!}
						/>
					</div>
				</CardContent>
			</Card>
		</Link>
	);
};
