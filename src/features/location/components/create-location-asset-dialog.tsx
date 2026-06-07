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

interface CreateLocationAssetDialogProps {
	farmId: string;
	triggerClassName?: string;
}

const EMPTY_FORM = {
	name: "",
	location: "",
	description: "",
};

export function CreateLocationAssetDialog({
	farmId,
	triggerClassName,
}: CreateLocationAssetDialogProps) {
	const [open, setOpen] = useState(false);
	const [name, setName] = useState(EMPTY_FORM.name);
	const [location, setLocation] = useState(EMPTY_FORM.location);
	const [description, setDescription] = useState(EMPTY_FORM.description);
	const [errorMessage, setErrorMessage] = useState("");
	const createLocationMutation = useCreateLivestockAsset();

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
			setErrorMessage("Ingresa el nombre de la ubicación.");
			return;
		}

		setErrorMessage("");

		try {
			await createLocationMutation.mutateAsync({
				farmId,
				data: {
					name: name.trim(),
					location: location.trim() || undefined,
					description: description.trim() || undefined,
					kind: "location",
					mode: "aggregated",
				},
			});

			handleOpenChange(false);
		} catch {
			setErrorMessage(
				"No se pudo crear la ubicación. Revisa los datos e intenta de nuevo.",
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
					Nueva ubicación
				</Button>
			</DialogTrigger>
			<DialogContent className="w-[calc(100vw-2rem)] max-w-128 p-4 sm:p-6">
				<DialogHeader>
					<DialogTitle>Crear ubicación</DialogTitle>
					<DialogDescription>
						Registra una nueva ubicación para esta granja.
					</DialogDescription>
				</DialogHeader>

				<form className="space-y-4" onSubmit={handleSubmit}>
					<div className="space-y-2">
						<Label htmlFor="location-name">Nombre</Label>
						<Input
							id="location-name"
							value={name}
							onChange={(event) => setName(event.target.value)}
							placeholder="Nombre de la ubicación"
							required
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="location-location">Ubicación</Label>
						<Input
							id="location-location"
							value={location}
							onChange={(event) => setLocation(event.target.value)}
							placeholder="Ubicación"
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="location-description">Descripción</Label>
						<Textarea
							id="location-description"
							value={description}
							onChange={(event) => setDescription(event.target.value)}
							placeholder="Descripción"
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
							disabled={createLocationMutation.isPending}
						>
							Cancelar
						</Button>
						<Button
							type="submit"
							variant="default"
							disabled={createLocationMutation.isPending}
						>
							{createLocationMutation.isPending ? "Creando..." : "Crear ubicación"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
