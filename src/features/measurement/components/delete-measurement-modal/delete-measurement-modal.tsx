import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { useDeleteMeasurementById } from "@/features/measurement/api/measurement-queries";
import { Trash2 } from "lucide-react";
import { useState } from "react";

interface DeleteMeasurementModalProps {
	measurementId: string;
	animalId: string;
}

export const DeleteMeasurementModal = ({
	measurementId,
	animalId,
}: DeleteMeasurementModalProps) => {
	const [open, setOpen] = useState(false);
	const { mutateAsync: deleteMeasurement } = useDeleteMeasurementById();

	const onSubmit = async () => {
		const response = await deleteMeasurement({
			animalId,
			measurementId,
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
				<DialogTitle>Do you want to delete this measurement?</DialogTitle>
				<DialogDescription>
					This will permanently remove the selected measurement record from the
					animal's history.
				</DialogDescription>
				<div>
					<Button onClick={onSubmit}>Delete</Button>
					<Button onClick={() => setOpen(false)}>Cancel</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
};
