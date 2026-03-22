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
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
}

export const CreateFlockModal = ({
	farmId,
	open: controlledOpen,
	onOpenChange,
}: CreateFlockModalProps) => {
	const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
	const { t } = useTranslation("flocks");

	const isControlled = controlledOpen !== undefined;
	const open = isControlled ? controlledOpen : uncontrolledOpen;

	const handleOpenChange = (value: boolean) => {
		if (!isControlled) setUncontrolledOpen(value);
		onOpenChange?.(value);
	};

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			{!isControlled && (
				<DialogTrigger asChild>
					<Button>
						<Plus className="h-4 w-4" />
						{t("page.newButton")}
					</Button>
				</DialogTrigger>
			)}
			<DialogContent className="w-full max-h-[90vh] overflow-y-auto p-4 sm:max-w-lg">
				<DialogTitle>{t("createModal.title")}</DialogTitle>
				<DialogDescription>{t("createModal.description")}</DialogDescription>
				<CreateFlockForm
					farmId={farmId}
					onSuccess={() => handleOpenChange(false)}
				/>
			</DialogContent>
		</Dialog>
	);
};
