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
import {
	useCreateLivestockAsset,
	useUpdateLivestockAssetById,
} from "@/features/livestock/api/livestock-queries";
import { ProduceAssetSelectField } from "@/features/livestock/components/produce-asset-select-field";
import { cn } from "@/lib/utils";

interface CreateCropAssetDialogProps {
	farmId: string;
	triggerClassName?: string;
}

const EMPTY_FORM = {
	name: "",
	location: "",
	description: "",
	produceAssetId: "none",
};

export function CreateCropAssetDialog({
	farmId,
	triggerClassName,
}: CreateCropAssetDialogProps) {
	const [open, setOpen] = useState(false);
	const [name, setName] = useState(EMPTY_FORM.name);
	const [location, setLocation] = useState(EMPTY_FORM.location);
	const [description, setDescription] = useState(EMPTY_FORM.description);
	const [produceAssetId, setProduceAssetId] = useState(
		EMPTY_FORM.produceAssetId,
	);
	const [errorMessage, setErrorMessage] = useState("");

	const createCropMutation = useCreateLivestockAsset();
	const updateCropMutation = useUpdateLivestockAssetById();

	const resetForm = () => {
		setName(EMPTY_FORM.name);
		setLocation(EMPTY_FORM.location);
		setDescription(EMPTY_FORM.description);
		setProduceAssetId(EMPTY_FORM.produceAssetId);
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
			setErrorMessage("Ingresa el nombre del cultivo.");
			return;
		}

		setErrorMessage("");

		try {
			// `AssetCreate` forbids extra fields, so the produce link is a follow-up PATCH.
			const created = await createCropMutation.mutateAsync({
				farmId,
				data: {
					name: name.trim(),
					location: location.trim() || undefined,
					description: description.trim() || undefined,
					kind: "crop",
				},
			});

			if (produceAssetId !== "none") {
				await updateCropMutation.mutateAsync({
					farmId,
					assetId: created.id,
					data: { produce_asset_id: Number(produceAssetId) },
				});
			}

			handleOpenChange(false);
		} catch {
			setErrorMessage(
				"No se pudo crear el cultivo. Revisa los datos e intenta de nuevo.",
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
					variant="default"
					className={cn(
						"rounded-full border-(--v2-border) px-3 py-1.5 text-xs font-semibold",
						triggerClassName,
					)}
				>
					Nuevo cultivo
				</Button>
			</DialogTrigger>
			<DialogContent className="w-[calc(100vw-2rem)] max-w-128 p-4 sm:p-6">
				<DialogHeader>
					<DialogTitle>Crear cultivo</DialogTitle>
					<DialogDescription>
						Registra un nuevo cultivo para esta granja.
					</DialogDescription>
				</DialogHeader>

				<form
					className="space-y-4"
					onSubmit={(event) => void handleSubmit(event)}
				>
					<div className="space-y-2">
						<Label htmlFor="crop-name">Nombre</Label>
						<Input
							id="crop-name"
							value={name}
							onChange={(event) => setName(event.target.value)}
							placeholder="Nombre del cultivo"
							required
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="crop-location">Ubicacion</Label>
						<Input
							id="crop-location"
							value={location}
							onChange={(event) => setLocation(event.target.value)}
							placeholder="Ubicacion"
						/>
					</div>

					<ProduceAssetSelectField
						farmId={farmId}
						value={produceAssetId}
						onChange={setProduceAssetId}
						label="Producto de cosecha (opcional)"
						helperText="Producto sugerido por defecto al registrar cosechas. Puedes crearlo aquí mismo."
					/>

					<div className="space-y-2">
						<Label htmlFor="crop-description">Descripcion</Label>
						<Textarea
							id="crop-description"
							value={description}
							onChange={(event) => setDescription(event.target.value)}
							placeholder="Descripcion"
							rows={3}
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
							disabled={createCropMutation.isPending}
						>
							Cancelar
						</Button>
						<Button
							type="submit"
							variant="default"
							disabled={createCropMutation.isPending}
						>
							{createCropMutation.isPending ? "Creando..." : "Crear cultivo"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
