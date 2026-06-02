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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
	useCreateLivestockAsset,
	useListLivestockAssetsByFarmId,
} from "@/features/livestock/api/livestock-queries";
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
	const materialAssetsQuery = useListLivestockAssetsByFarmId({
		farmId,
		filters: { kind: "material", page: 1, pageSize: 100 },
		enabled: !!farmId && open,
	});

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
			await createCropMutation.mutateAsync({
				farmId,
				data: {
					name: name.trim(),
					location: location.trim() || undefined,
					description: description.trim() || undefined,
					kind: "crop",
					mode: "aggregated",
					produce_asset_id:
						produceAssetId !== "none" ? Number(produceAssetId) : undefined,
				},
			});

			handleOpenChange(false);
		} catch {
			setErrorMessage(
				"No se pudo crear el cultivo. Revisa los datos e intenta de nuevo.",
			);
		}
	};

	const materials = materialAssetsQuery.data?.data ?? [];

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

					<div className="space-y-2">
						<Label htmlFor="crop-produce">Material de produce (opcional)</Label>
						<Select
							value={produceAssetId}
							onValueChange={setProduceAssetId}
						>
							<SelectTrigger
								id="crop-produce"
								className="w-full"
							>
								<SelectValue placeholder="Sin material vinculado" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="none">Sin material vinculado</SelectItem>
								{materials.map((mat) => (
									<SelectItem
										key={mat.id}
										value={String(mat.id)}
									>
										{mat.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<p className="text-xs text-(--v2-ink-soft)">
							Vincula un material para que las cosechas actualicen su inventario.
						</p>
					</div>

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
						<p className="text-sm text-red-700">{errorMessage}</p>
					) : null}

					<DialogFooter>
						<Button
							type="button"
							variant="neutral"
							onClick={() => handleOpenChange(false)}
							disabled={createCropMutation.isPending}
						>
							Cancelar
						</Button>
						<Button
							type="submit"
							variant="create"
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
