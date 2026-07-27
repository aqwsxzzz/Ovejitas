import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Combobox, type ComboboxOption } from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	useCreateLivestockAsset,
	useListLivestockAssetsByFarmId,
} from "@/features/livestock/api/livestock-queries";

const NONE_OPTION_VALUE = "none";

interface ProduceAssetSelectFieldProps {
	farmId: string;
	/** Selected produce asset id as string, or "none". */
	value: string;
	onChange: (value: string) => void;
	label: string;
	helperText?: string;
	disabled?: boolean;
}

/**
 * Picks a `produce` asset (the pool a producer harvests into), with an inline
 * "create new" row so a first product can be made without leaving the form —
 * ordering (product-before-animal) never matters.
 */
export function ProduceAssetSelectField({
	farmId,
	value,
	onChange,
	label,
	helperText,
	disabled = false,
}: ProduceAssetSelectFieldProps) {
	const [isCreating, setIsCreating] = useState(false);
	const [newName, setNewName] = useState("");
	const [error, setError] = useState("");

	const { data: response } = useListLivestockAssetsByFarmId({
		farmId,
		filters: { kind: "produce", page: 1, pageSize: 100 },
		enabled: !!farmId,
	});
	const createMutation = useCreateLivestockAsset();

	const options = useMemo<ComboboxOption[]>(
		() => [
			{ value: NONE_OPTION_VALUE, label: "Sin producto vinculado" },
			...(response?.data ?? []).map((asset) => ({
				value: String(asset.id),
				label: asset.name,
			})),
		],
		[response?.data],
	);

	const handleValueChange = (next: string) => {
		setIsCreating(false);
		onChange(next);
	};

	const handleCreate = async () => {
		setError("");
		if (!newName.trim()) {
			setError("Escribe un nombre.");
			return;
		}
		try {
			const created = await createMutation.mutateAsync({
				farmId,
				data: { name: newName.trim(), kind: "produce" },
			});
			onChange(String(created.id));
			setNewName("");
			setIsCreating(false);
		} catch {
			setError("No se pudo crear el producto.");
		}
	};

	return (
		<div className="space-y-1.5">
			<Label>{label}</Label>
			<Combobox
				options={options}
				value={value}
				onChange={handleValueChange}
				disabled={disabled}
				placeholder="Sin producto vinculado"
				searchPlaceholder="Buscar producto"
				createLabel="Nuevo producto"
				onCreateSelect={() => setIsCreating(true)}
			/>

			{isCreating ? (
				<div className="grid gap-2 rounded-lg border bg-muted/40 p-2">
					<Input
						value={newName}
						onChange={(event) => setNewName(event.target.value)}
						placeholder="Nombre del producto (ej. Huevos)"
					/>
					{error ? <p className="text-sm text-destructive">{error}</p> : null}
					<div className="flex justify-end gap-2">
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={() => setIsCreating(false)}
						>
							Cancelar
						</Button>
						<Button
							type="button"
							size="sm"
							onClick={() => void handleCreate()}
							disabled={createMutation.isPending}
						>
							{createMutation.isPending ? "Creando..." : "Crear"}
						</Button>
					</div>
				</div>
			) : null}

			{helperText ? (
				<p className="text-xs text-(--v2-ink-soft)">{helperText}</p>
			) : null}
		</div>
	);
}
