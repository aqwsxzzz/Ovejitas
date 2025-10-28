import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { useDeleteAnimalById } from "@/features/animal/api/animal-queries";
import type { IAnimal } from "@/features/animal/types/animal-types";
import { useParams } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

interface DeleteAnimalProps {
	animal: IAnimal;
	sex: IAnimal["sex"] | "";
	speciesId: IAnimal["speciesId"] | "";
}

export const DeleteAnimalModal = ({
	animal,
	sex,
	speciesId,
}: DeleteAnimalProps) => {
	const { t } = useTranslation("deleteAnimalModal");
	const [open, setOpen] = useState(false);
	const { farmId } = useParams({ strict: false });
	const { mutateAsync: deleteAnimal } = useDeleteAnimalById();
	const onSubmit = async () => {
		const response = await deleteAnimal({
			farmId: farmId!,
			animalId: animal.id,
			filters: {
				sex,
				speciesId,
			}
		});
		if (response.status === "success") setOpen(false);
	};

	return (
		<Dialog
			open={open}
			onOpenChange={setOpen}
		>
			<DialogTrigger asChild>
				<Button className="bg-destructive">
					<Trash2 />
				</Button>
			</DialogTrigger>
			<DialogContent className="max-w-70">
				<DialogTitle>
					{t("deleteTitle1")}
					{animal.name} {animal.tagNumber}
					{t("deleteTitle2")}
				</DialogTitle>
				<DialogDescription>
					{t("deleteMessage1")}
					<strong> {animal.name} </strong> {t("deleteMessage2")}
				</DialogDescription>
				<div className="flex justify-between mt-4">
					<Button
						onClick={onSubmit}
						className="bg-destructive"
					>
						{t("deleteButton")}
					</Button>
					<Button onClick={() => setOpen(false)}>{t("cancelButton")}</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
};
