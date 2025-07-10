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

interface DeleteAnimalProps {
	animal: IAnimal;
}

export const DeleteAnimalModal = ({ animal }: DeleteAnimalProps) => {
	const [open, setOpen] = useState(false);
	const { farmId } = useParams({ strict: false });
	const { mutateAsync: deleteAnimal } = useDeleteAnimalById();
	const onSubmit = async () => {
		const response = await deleteAnimal({
			farmId: farmId!,
			animalId: animal.id,
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
					Do you want to delete {animal.name} {animal.tagNumber} from your farm?
				</DialogTitle>
				<DialogDescription>
					This will erase any information given from{" "}
					<strong> {animal.name} </strong> to other animals, like relantionships
					and others. Remember that animals tagged as "sold" will not be count
					as animals in your farm and will not be shown in your animals
					dashboard.
				</DialogDescription>
				<div>
					<Button onClick={onSubmit}>Delete</Button>
					<Button onClick={() => setOpen(false)}>Cancel</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
};
