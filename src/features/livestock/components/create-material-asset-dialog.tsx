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

/** Stock-bearing kinds share this dialog: `material` (inputs you buy) and `produce` (pools you harvest into). */
type StockAssetKind = "material" | "produce";

interface CreateMaterialAssetDialogProps {
	farmId: string;
	triggerClassName?: string;
	kind?: StockAssetKind;
}

const COPY: Record<
	StockAssetKind,
	{
		trigger: string;
		title: string;
		description: string;
		placeholder: string;
		submit: string;
		submitting: string;
		missingName: string;
		failure: string;
	}
> = {
	material: {
		trigger: "Nuevo material",
		title: "Crear material",
		description: "Registra un nuevo material para esta granja.",
		placeholder: "Nombre del material",
		submit: "Crear material",
		submitting: "Creando...",
		missingName: "Ingresa el nombre del material.",
		failure: "No se pudo crear el material. Revisa los datos e intenta de nuevo.",
	},
	produce: {
		trigger: "Nuevo producto",
		title: "Crear producto",
		description:
			"Registra un producto (la canasta donde se acumula lo que producen tus activos).",
		placeholder: "Nombre del producto (ej. Huevos)",
		submit: "Crear producto",
		submitting: "Creando...",
		missingName: "Ingresa el nombre del producto.",
		failure: "No se pudo crear el producto. Revisa los datos e intenta de nuevo.",
	},
};

const EMPTY_FORM = {
	name: "",
	location: "",
	description: "",
};

export function CreateMaterialAssetDialog({
	farmId,
	triggerClassName,
	kind = "material",
}: CreateMaterialAssetDialogProps) {
	const copy = COPY[kind];
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
			setErrorMessage(copy.missingName);
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
					kind,
				},
			});

			handleOpenChange(false);
		} catch {
			setErrorMessage(copy.failure);
		}
	};

	return (
		<Dialog
			open={open}
			onOpenChange={handleOpenChange}
		>
			<DialogTrigger asChild>
				<Button
					variant="default"
					className={cn(
						"rounded-full border-(--v2-border) px-3 py-1.5 text-xs font-semibold",
						triggerClassName,
					)}
				>
					{copy.trigger}
				</Button>
			</DialogTrigger>
			<DialogContent className="w-[calc(100vw-2rem)] max-w-128 p-4 sm:p-6">
				<DialogHeader>
					<DialogTitle>{copy.title}</DialogTitle>
					<DialogDescription>{copy.description}</DialogDescription>
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
							placeholder={copy.placeholder}
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
						<p className="text-sm text-destructive">{errorMessage}</p>
					) : null}

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => handleOpenChange(false)}
							disabled={createMaterialMutation.isPending}
						>
							Cancelar
						</Button>
						<Button
							type="submit"
							variant="default"
							disabled={createMaterialMutation.isPending}
						>
							{createMaterialMutation.isPending
								? copy.submitting
								: copy.submit}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
