import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { CreateFlockForm } from "@/features/flock/components/create-flock-form";

interface CreateFlockModalProps {
	farmId: string;
}

export const CreateFlockModal = ({ farmId }: CreateFlockModalProps) => {
	const [open, setOpen] = useState(false);
	const { t } = useTranslation("flocks");

	return (
		<Dialog
			open={open}
			onOpenChange={setOpen}
		>
			<DialogTrigger asChild>
				<Button>
					<Plus className="h-4 w-4" />
					{t("page.newButton")}
				</Button>
			</DialogTrigger>
			<DialogContent className="max-h-[90vh] overflow-y-auto p-4">
				<DialogTitle>{t("createModal.title")}</DialogTitle>
				<DialogDescription>{t("createModal.description")}</DialogDescription>
				<CreateFlockForm
					farmId={farmId}
					onSuccess={() => setOpen(false)}
				/>
			</DialogContent>
		</Dialog>
	);
};
