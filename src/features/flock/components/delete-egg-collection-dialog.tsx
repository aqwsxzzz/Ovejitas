import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { useDeleteEggCollection } from "@/features/flock/api/flock-queries";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

interface DeleteEggCollectionDialogProps {
	flockId: string;
	farmId: string;
	collectionId: string;
}

export const DeleteEggCollectionDialog = ({
	flockId,
	farmId,
	collectionId,
}: DeleteEggCollectionDialogProps) => {
	const [open, setOpen] = useState(false);
	const { t } = useTranslation("flocks");
	const { mutateAsync: deleteCollection, isPending } = useDeleteEggCollection();

	const handleConfirm = async () => {
		const response = await deleteCollection({ flockId, farmId, collectionId });
		if (response.status === "success") setOpen(false);
	};

	return (
		<Dialog
			open={open}
			onOpenChange={setOpen}
		>
			<DialogTrigger asChild>
				<Button
					variant="ghost"
					size="icon"
					className="h-8 w-8 text-destructive hover:text-destructive"
				>
					<Trash2 className="h-4 w-4" />
					<span className="sr-only">{t("detail.eggCollections.delete")}</span>
				</Button>
			</DialogTrigger>
			<DialogContent className="max-w-sm">
				<DialogTitle>
					{t("detail.eggCollections.deleteDialog.title")}
				</DialogTitle>
				<DialogDescription>
					{t("detail.eggCollections.deleteDialog.description")}
				</DialogDescription>
				<div className="flex justify-end gap-2">
					<Button
						variant="outline"
						onClick={() => setOpen(false)}
						disabled={isPending}
					>
						{t("detail.eggCollections.deleteDialog.cancel")}
					</Button>
					<Button
						variant="destructive"
						onClick={() => void handleConfirm()}
						disabled={isPending}
					>
						{isPending
							? t("common.deleting")
							: t("detail.eggCollections.deleteDialog.confirm")}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
};
