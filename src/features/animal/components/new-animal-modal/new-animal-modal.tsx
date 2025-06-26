import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { NewAnimalForm } from "@/features/animal/components/new-animal-modal/new-animal-form";
import { useState } from "react";

export const NewAnimalModal = () => {
    const [open, setOpen] = useState<boolean>(false);
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger>
                <Button variant="outline">New Animal</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogTitle>Create a new animal</DialogTitle>
                <DialogDescription>Here you can create a new animal to join your farm!</DialogDescription>
                <NewAnimalForm />
            </DialogContent>
        </Dialog>
    );
};
