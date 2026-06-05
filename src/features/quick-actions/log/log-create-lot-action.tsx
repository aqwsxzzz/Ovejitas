import { useState } from "react";
import type { FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	useCreateFlockAcquisitionByAssetId,
	useCreateLivestockAsset,
} from "@/features/livestock/api/livestock-queries";
import type { LivestockAssetMode } from "@/features/livestock/types/livestock-types";

import { LogActionCard } from "./log-action-card";

interface LogCreateLotActionProps {
	farmId: string;
	onDone: () => void;
}

export function LogCreateLotAction({ farmId, onDone }: LogCreateLotActionProps) {
	const [name, setName] = useState("");
	const [location, setLocation] = useState("");
	const [initialAmount, setInitialAmount] = useState("");
	const [description, setDescription] = useState("");
	const [mode, setMode] = useState<LivestockAssetMode>("aggregated");
	const [error, setError] = useState<string | null>(null);

	const createAsset = useCreateLivestockAsset();
	const createAcquisition = useCreateFlockAcquisitionByAssetId();
	const isSaving = createAsset.isPending || createAcquisition.isPending;

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!name.trim()) return;
		const parsedInitialAmount = Number(initialAmount);
		if (
			mode === "aggregated" &&
			(!Number.isInteger(parsedInitialAmount) || parsedInitialAmount <= 0)
		) {
			setError("Ingresa una cantidad inicial entera mayor que cero.");
			return;
		}
		setError(null);
		try {
			const createdAsset = await createAsset.mutateAsync({
				farmId,
				data: {
					name: name.trim(),
					location: location.trim() || undefined,
					description: description.trim() || undefined,
					kind: "animal",
					mode,
				},
			});
			if (mode === "aggregated") {
				await createAcquisition.mutateAsync({
					farmId,
					assetId: String(createdAsset.id),
					payload: {
						occurred_at: new Date().toISOString(),
						quantity: parsedInitialAmount,
						amount: null,
					},
				});
			}
			onDone();
		} catch {
			setError("No se pudo crear el lote. Revisa los datos e intenta de nuevo.");
		}
	};

	return (
		<LogActionCard
			title="Crear lote"
			subtitle="Este flujo solo crea registros nuevos."
		>
			<form
				className="space-y-3"
				onSubmit={(event) => void handleSubmit(event)}
			>
				<div className="space-y-1.5">
					<Label>Modo de seguimiento</Label>
					<div className="flex gap-2">
						<Button
							type="button"
							variant={mode === "aggregated" ? "create" : "neutral"}
							className="flex-1"
							onClick={() => setMode("aggregated")}
						>
							Agrupado
						</Button>
						<Button
							type="button"
							variant={mode === "individual" ? "create" : "neutral"}
							className="flex-1"
							onClick={() => setMode("individual")}
						>
							Individual
						</Button>
					</div>
				</div>
				<div className="space-y-1.5">
					<Label htmlFor="lot-name">Nombre del lote</Label>
					<Input
						id="lot-name"
						value={name}
						onChange={(event) => setName(event.target.value)}
					/>
				</div>
				<div className="space-y-1.5">
					<Label htmlFor="lot-location">Ubicacion</Label>
					<Input
						id="lot-location"
						value={location}
						onChange={(event) => setLocation(event.target.value)}
					/>
				</div>
				{mode === "aggregated" ? (
					<div className="space-y-1.5">
						<Label htmlFor="lot-initial-amount">Cantidad inicial</Label>
						<Input
							id="lot-initial-amount"
							type="number"
							min="1"
							step="1"
							value={initialAmount}
							onChange={(event) => setInitialAmount(event.target.value)}
						/>
					</div>
				) : null}
				<div className="space-y-1.5">
					<Label htmlFor="lot-description">Descripcion</Label>
					<Textarea
						id="lot-description"
						rows={3}
						value={description}
						onChange={(event) => setDescription(event.target.value)}
					/>
				</div>
				{error ? <p className="text-sm text-red-700">{error}</p> : null}
				<div className="flex justify-end">
					<Button
						type="submit"
						variant="create"
						disabled={isSaving}
					>
						{isSaving ? "Guardando..." : "Crear lote"}
					</Button>
				</div>
			</form>
		</LogActionCard>
	);
}
