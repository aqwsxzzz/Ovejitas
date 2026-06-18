import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateLivestockAsset } from "@/features/livestock/api/livestock-queries";
import { cn } from "@/lib/utils";

interface CreateEquipmentAssetDialogProps {
	farmId: string;
	triggerClassName?: string;
}

const EMPTY_FORM = {
	name: "",
	location: "",
	description: "",
};

export function CreateEquipmentAssetDialog({
	farmId,
	triggerClassName,
}: CreateEquipmentAssetDialogProps) {
	const [open, setOpen] = useState(false);
	const [name, setName] = useState(EMPTY_FORM.name);
	const [location, setLocation] = useState(EMPTY_FORM.location);
	const [description, setDescription] = useState(EMPTY_FORM.description);
	const [errorMessage, setErrorMessage] = useState("");
	const createEquipmentMutation = useCreateLivestockAsset();

	const resetForm = () => {
		setName(EMPTY_FORM.name);
		setLocation(EMPTY_FORM.location);
		setDescription(EMPTY_FORM.description);
		setErrorMessage("");
	};

	const handleOpenChange = (nextOpen: boolean) => {
		setOpen(nextOpen);
		if (!nextOpen) {
			resetForm();
		}
	};

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		if (!farmId) return;
		if (!name.trim()) {
			setErrorMessage("Ingresa el nombre del equipo.");
			return;
		}

		setErrorMessage("");

		try {
			await createEquipmentMutation.mutateAsync({
				farmId,
				data: {
					name: name.trim(),
					location: location.trim() || undefined,
					description: description.trim() || undefined,
					kind: "equipment",
				},
			});

			handleOpenChange(false);
		} catch {
			setErrorMessage(
				"No se pudo crear el equipo. Revisa los datos e intenta de nuevo.",
			);
		}
	};

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogTrigger asChild>
				<Button
					variant="default"
					className={cn(
						"rounded-full border-(--v2-border) px-3 py-1.5 text-xs font-semibold",
						triggerClassName,
					)}
				>
					Nuevo equipo
				</Button>
			</DialogTrigger>
			<DialogContent className="w-[calc(100vw-2rem)] max-w-128 p-4 sm:p-6">
				<DialogHeader>
					<DialogTitle>Crear equipo</DialogTitle>
					<DialogDescription>
						Registra un nuevo equipo para esta granja.
					</DialogDescription>
				</DialogHeader>

				<form className="space-y-4" onSubmit={handleSubmit}>
					<div className="space-y-2">
						<Label htmlFor="equipment-name">Nombre</Label>
						<Input
							id="equipment-name"
							value={name}
							onChange={(event) => setName(event.target.value)}
							placeholder="Nombre del equipo"
							required
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="equipment-location">Ubicacion</Label>
						<Input
							id="equipment-location"
							value={location}
							onChange={(event) => setLocation(event.target.value)}
							placeholder="Ubicacion"
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="equipment-description">Descripcion</Label>
						<Textarea
							id="equipment-description"
							value={description}
							onChange={(event) => setDescription(event.target.value)}
							placeholder="Descripcion"
							rows={4}
						/>
					</div>

					{errorMessage ? (
						<p className="text-sm text-destructive">{errorMessage}</p>
					) : null}

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => handleOpenChange(false)}
							disabled={createEquipmentMutation.isPending}
						>
							Cancelar
						</Button>
						<Button
							type="submit"
							variant="default"
							disabled={createEquipmentMutation.isPending}
						>
							{createEquipmentMutation.isPending ? "Creando..." : "Crear equipo"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
