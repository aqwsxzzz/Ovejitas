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
import type { ReactNode } from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

interface EditAnimalModalProps {
	animal: IAnimal;
	trigger?: ReactNode;
}

export const EditAnimalModal = ({ animal, trigger }: EditAnimalModalProps) => {
	const [open, setOpen] = useState<boolean>(false);
	const { t } = useTranslation("editAnimalModal");

	return (
		<Dialog
			open={open}
			onOpenChange={setOpen}
		>
			<DialogTrigger asChild>
				{trigger ?? (
					<Button
						variant="outline"
						className="bg-primary text-primary-foreground"
					>
						<Pencil />
					</Button>
				)}
			</DialogTrigger>
			<DialogContent className="w-[calc(100vw-2rem)] max-w-[36rem] min-w-[20rem] max-h-[90vh] overflow-y-auto p-4 sm:max-w-[36rem] sm:p-6">
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
