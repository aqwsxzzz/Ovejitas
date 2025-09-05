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
import { useTranslation } from "react-i18next";

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
	const { t } = useTranslation("deleteMeasurementModal");

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
				<DialogTitle>{t("deleteTitle")}</DialogTitle>
				<DialogDescription>{t("deleteDescription")}</DialogDescription>
				<div>
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
