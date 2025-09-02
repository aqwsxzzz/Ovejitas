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

export const NewAnimalModal = () => {
	const [open, setOpen] = useState<boolean>(false);
	const [createMode, setCreateMode] = useState<"single" | "bulk">("single");

	return (
		<Dialog
			open={open}
			onOpenChange={setOpen}
		>
			<DialogTrigger asChild>
				<Button
					variant="outline"
					className="bg-primary text-primary-foreground w-fit ml-auto"
				>
					Add Animal
				</Button>
			</DialogTrigger>
			<DialogContent className="max-h-[90vh] overflow-y-auto p-4">
				<DialogTitle>Create a new animal</DialogTitle>
				<DialogDescription>
					Here you can create a new animal to join your farm!
				</DialogDescription>
				<RadioGroup
					className="flex justify-center"
					defaultValue="single"
					onValueChange={(value) => setCreateMode(value as "single" | "bulk")}
				>
					<div className="flex flex-col items-center gap-2">
						<Label htmlFor="single">Single</Label>
						<RadioGroupItem
							value="single"
							id="single"
						/>
					</div>
					<div className="flex flex-col items-center gap-2">
						<Label htmlFor="bulk">Bulk</Label>
						<RadioGroupItem
							value="bulk"
							id="bulk"
						/>
					</div>
				</RadioGroup>
				{createMode === "single" ? (
					<NewAnimalForm closeDialog={() => setOpen(false)} />
				) : (
					<NewAnimalBulkForm closeDialog={() => setOpen(false)} />
				)}
			</DialogContent>
		</Dialog>
	);
};
