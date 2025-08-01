import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { AddNewMeasurementForm } from "@/features/measurement/components/add-new-measurement-modal/add-new-measurement-form";
import { Plus } from "lucide-react";
import { useState } from "react";

export const AddNewMeasurementModal = () => {
	const [open, setOpen] = useState<boolean>(false);

	return (
		<Dialog
			open={open}
			onOpenChange={setOpen}
		>
			<DialogTrigger asChild>
				<Button>
					<Plus />
				</Button>
			</DialogTrigger>
			<DialogContent aria-describedby={undefined}>
				<DialogHeader>
					<DialogTitle>Add a New Measurement</DialogTitle>
				</DialogHeader>
				<AddNewMeasurementForm closeDialog={() => setOpen(false)} />
			</DialogContent>
		</Dialog>
	);
};
