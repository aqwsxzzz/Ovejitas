import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { NewAnimalBulkForm } from "@/features/animal/components/new-animal-modal/new-animal-bulk-form";
import { NewAnimalForm } from "@/features/animal/components/new-animal-modal/new-animal-form";
import { useState } from "react";
import { useTranslation } from "react-i18next";

interface NewAnimalModalProps {
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
}

export const NewAnimalModal = ({ open: controlledOpen, onOpenChange }: NewAnimalModalProps = {}) => {
	const [internalOpen, setInternalOpen] = useState<boolean>(false);
	const [createMode, setCreateMode] = useState<"single" | "bulk">("single");
	const { t } = useTranslation("newAnimalModal");

	// Use controlled state if provided, otherwise use internal state
	const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
	const handleOpenChange = onOpenChange || setInternalOpen;

	return (
		<Dialog
			open={isOpen}
			onOpenChange={handleOpenChange}
		>
			{!onOpenChange && (
				<DialogTrigger asChild>
					<Button
						variant="outline"
						className="bg-primary text-primary-foreground w-fit ml-auto"
					>
						{t("addAnimalButton")}
					</Button>
				</DialogTrigger>
			)}
			<DialogContent className="max-h-[90vh] overflow-y-auto p-4">
				<DialogTitle>{t("addAnimalTitle")}</DialogTitle>
				<DialogDescription>{t("addAnimalDescription")}</DialogDescription>
				<RadioGroup
					className="flex justify-center"
					defaultValue="single"
					onValueChange={(value) => setCreateMode(value as "single" | "bulk")}
				>
					<div className="flex flex-col items-center gap-2">
						<Label htmlFor="single">
							{t("radioGroupOptions.singleOption")}
						</Label>
						<RadioGroupItem
							value="single"
							id="single"
						/>
					</div>
					<div className="flex flex-col items-center gap-2">
						<Label htmlFor="bulk">{t("radioGroupOptions.bulkOption")}</Label>
						<RadioGroupItem
							value="bulk"
							id="bulk"
						/>
					</div>
				</RadioGroup>
				{createMode === "single" ? (
					<NewAnimalForm closeDialog={() => handleOpenChange(false)} />
				) : (
					<NewAnimalBulkForm closeDialog={() => handleOpenChange(false)} />
				)}
			</DialogContent>
		</Dialog>
	);
};
