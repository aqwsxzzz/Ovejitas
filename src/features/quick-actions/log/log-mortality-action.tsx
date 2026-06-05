import { useState } from "react";
import type { FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateFlockMortalityByAssetId } from "@/features/livestock/api/livestock-queries";

import { LogActionCard } from "./log-action-card";
import { LogAssetPicker } from "./log-asset-picker";

interface LogMortalityActionProps {
	farmId: string;
	contextAssetId: string | null;
	title: string;
	subtitle: string;
	onDone: () => void;
}

export function LogMortalityAction({
	farmId,
	contextAssetId,
	title,
	subtitle,
	onDone,
}: LogMortalityActionProps) {
	const [pickedAssetId, setPickedAssetId] = useState("");
	const assetId = contextAssetId ?? pickedAssetId;

	const [quantity, setQuantity] = useState("");
	const [cause, setCause] = useState("");
	const [error, setError] = useState<string | null>(null);
	const createMortality = useCreateFlockMortalityByAssetId();

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const parsedQuantity = Number(quantity);
		if (!Number.isInteger(parsedQuantity) || parsedQuantity <= 0) {
			setError("Ingresa una cantidad entera mayor que cero.");
			return;
		}
		setError(null);
		try {
			await createMortality.mutateAsync({
				farmId,
				assetId,
				payload: {
					occurred_at: new Date().toISOString(),
					quantity: parsedQuantity,
					cause: cause.trim() || null,
				},
			});
			onDone();
		} catch {
			setError("No se pudo registrar la mortalidad. Intenta de nuevo.");
		}
	};

	return (
		<LogActionCard
			title={title}
			subtitle={subtitle}
		>
			{!contextAssetId ? (
				<LogAssetPicker
					farmId={farmId}
					value={pickedAssetId}
					onChange={setPickedAssetId}
					assetKinds={["animal"]}
					label="Lote"
				/>
			) : null}

			{assetId ? (
				<form
					className="space-y-3"
					onSubmit={(event) => void handleSubmit(event)}
				>
					<div className="space-y-1.5">
						<Label htmlFor="mortality-quantity">Cantidad de bajas</Label>
						<Input
							id="mortality-quantity"
							type="number"
							min="1"
							step="1"
							value={quantity}
							onChange={(event) => setQuantity(event.target.value)}
						/>
					</div>
					<div className="space-y-1.5">
						<Label htmlFor="mortality-cause">Causa (opcional)</Label>
						<Textarea
							id="mortality-cause"
							rows={2}
							value={cause}
							onChange={(event) => setCause(event.target.value)}
						/>
					</div>
					{error ? <p className="text-sm text-red-700">{error}</p> : null}
					<div className="flex justify-end">
						<Button
							type="submit"
							disabled={createMortality.isPending}
						>
							{createMortality.isPending
								? "Registrando..."
								: "Registrar mortalidad"}
						</Button>
					</div>
				</form>
			) : (
				<p className="text-sm text-(--v2-ink-soft)">
					Selecciona un lote para continuar.
				</p>
			)}
		</LogActionCard>
	);
}
