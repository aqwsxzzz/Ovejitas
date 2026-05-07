import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { RecordEggCollectionForm } from "@/features/flock/components/record-egg-collection-form";
import type { IEggCollection } from "@/features/flock/types/flock-types";
import { Pencil, Plus } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

interface BaseProps {
	flockId: string;
	farmId: string;
}

type RecordEggCollectionModalProps =
	| (BaseProps & { mode: "create" })
	| (BaseProps & { mode: "edit"; collection: IEggCollection });

export const RecordEggCollectionModal = (
	props: RecordEggCollectionModalProps,
) => {
	const [open, setOpen] = useState(false);
	const { t } = useTranslation("flocks");

	const title =
		props.mode === "create"
			? t("detail.eggCollections.recordModal.title")
			: t("detail.eggCollections.recordModal.editTitle");

	return (
		<Dialog
			open={open}
			onOpenChange={setOpen}
		>
			<DialogTrigger asChild>
				{props.mode === "create" ? (
					<Button size="sm">
						<Plus className="h-4 w-4" />
						{t("detail.eggCollections.record")}
					</Button>
				) : (
					<Button
						variant="ghost"
						size="icon"
						className="h-8 w-8"
					>
						<Pencil className="h-4 w-4" />
						<span className="sr-only">{t("detail.eggCollections.edit")}</span>
					</Button>
				)}
			</DialogTrigger>
			<DialogContent aria-describedby={undefined}>
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
				</DialogHeader>
				{props.mode === "create" ? (
					<RecordEggCollectionForm
						mode="create"
						flockId={props.flockId}
						farmId={props.farmId}
						onClose={() => setOpen(false)}
					/>
				) : (
					<RecordEggCollectionForm
						mode="edit"
						flockId={props.flockId}
						farmId={props.farmId}
						collection={props.collection}
						onClose={() => setOpen(false)}
					/>
				)}
			</DialogContent>
		</Dialog>
	);
};
