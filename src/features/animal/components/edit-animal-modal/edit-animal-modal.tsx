import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { EditAnimalForm } from "@/features/animal/components/edit-animal-modal/edit-animal-form";
import type { IAnimal } from "@/features/animal/types/animal-types";
import { Pencil } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

interface EditAnimalModalProps {
	animal: IAnimal;
}

export const EditAnimalModal = ({ animal }: EditAnimalModalProps) => {
	const [open, setOpen] = useState<boolean>(false);
	const { t } = useTranslation("editAnimalModal");

	return (
		<Dialog
			open={open}
			onOpenChange={setOpen}
		>
			<DialogTrigger asChild>
				<Button
					variant="outline"
					className="bg-primary text-primary-foreground"
				>
					<Pencil />
				</Button>
			</DialogTrigger>
			<DialogContent className="max-h-[90vh] overflow-y-auto p-4">
				<DialogTitle>{t("editTitle")}</DialogTitle>
				<DialogDescription>{t("editDescription")}</DialogDescription>
				<EditAnimalForm
					animal={animal}
					closeDialog={() => setOpen(false)}
				/>
			</DialogContent>
		</Dialog>
	);
};
