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

interface CreateMaterialAssetDialogProps {
	farmId: string;
	triggerClassName?: string;
}

const EMPTY_FORM = {
	name: "",
	location: "",
	description: "",
};

export function CreateMaterialAssetDialog({
	farmId,
	triggerClassName,
}: CreateMaterialAssetDialogProps) {
	const [open, setOpen] = useState(false);
	const [name, setName] = useState(EMPTY_FORM.name);
	const [location, setLocation] = useState(EMPTY_FORM.location);
	const [description, setDescription] = useState(EMPTY_FORM.description);
	const [errorMessage, setErrorMessage] = useState("");
	const createMaterialMutation = useCreateLivestockAsset();

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
			setErrorMessage("Ingresa el nombre del material.");
			return;
		}

		setErrorMessage("");

		try {
			await createMaterialMutation.mutateAsync({
				farmId,
				data: {
					name: name.trim(),
					location: location.trim() || undefined,
					description: description.trim() || undefined,
					kind: "material",
					mode: "aggregated",
				},
			});

			handleOpenChange(false);
		} catch {
			setErrorMessage(
				"No se pudo crear el material. Revisa los datos e intenta de nuevo.",
			);
		}
	};

	return (
		<Dialog
			open={open}
			onOpenChange={handleOpenChange}
		>
			<DialogTrigger asChild>
				<Button
					variant="outline"
					className={cn(
						"rounded-full border-(--v2-border) bg-white px-3 py-1.5 text-xs font-semibold",
						triggerClassName,
					)}
				>
					Nuevo material
				</Button>
			</DialogTrigger>
			<DialogContent className="w-[calc(100vw-2rem)] max-w-128 p-4 sm:p-6">
				<DialogHeader>
					<DialogTitle>Crear material</DialogTitle>
					<DialogDescription>
						Registra un nuevo material para esta granja.
					</DialogDescription>
				</DialogHeader>

				<form
					className="space-y-4"
					onSubmit={handleSubmit}
				>
					<div className="space-y-2">
						<Label htmlFor="material-name">Nombre</Label>
						<Input
							id="material-name"
							value={name}
							onChange={(event) => setName(event.target.value)}
							placeholder="Nombre del material"
							required
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="material-location">Ubicacion</Label>
						<Input
							id="material-location"
							value={location}
							onChange={(event) => setLocation(event.target.value)}
							placeholder="Ubicacion"
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="material-description">Descripcion</Label>
						<Textarea
							id="material-description"
							value={description}
							onChange={(event) => setDescription(event.target.value)}
							placeholder="Descripcion"
							rows={4}
						/>
					</div>

					{errorMessage ? (
						<p className="text-sm text-red-700">{errorMessage}</p>
					) : null}

					<DialogFooter>
						<Button
							type="button"
							variant="neutral"
							onClick={() => handleOpenChange(false)}
							disabled={createMaterialMutation.isPending}
						>
							Cancelar
						</Button>
						<Button
							type="submit"
							variant="create"
							disabled={createMaterialMutation.isPending}
						>
							{createMaterialMutation.isPending
								? "Creando..."
								: "Crear material"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
