import { useMemo, useState } from "react";
import type { FormEvent } from "react";

import { Button } from "@/components/ui/button";
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
import { EVENT_UNITS } from "@/shared/types/unit-types";
import { useListIndividualsByAssetId } from "@/features/livestock/api/livestock-queries";
import type {
	LivestockEventUnit,
	MaterialConsumptionReason,
} from "@/features/livestock/types/livestock-types";
import type { IMaterialConsumptionCreatePayload } from "@/features/livestock/api/livestock-api";

interface ConsumerAssetOption {
	id: number;
	name: string;
}

interface MaterialConsumptionFormProps {
	farmId?: string;
	materialAssetId: number;
	consumerAssets: ConsumerAssetOption[];
	isSubmitting: boolean;
	errorMessage: string | null;
	onSubmit: (payload: IMaterialConsumptionCreatePayload) => Promise<void>;
}

export function MaterialConsumptionForm({
	farmId = "",
	materialAssetId,
	consumerAssets,
	isSubmitting,
	errorMessage,
	onSubmit,
}: MaterialConsumptionFormProps) {
	const [occurredAt, setOccurredAt] = useState(
		new Date().toISOString().slice(0, 16),
	);
	const [quantity, setQuantity] = useState("");
	const [unit, setUnit] = useState<LivestockEventUnit>("kg");
	const [reason, setReason] = useState<MaterialConsumptionReason>("feeding");
	const [consumerAssetId, setConsumerAssetId] = useState<string>("");
	const [individualId, setIndividualId] = useState<string>("");
	const [notes, setNotes] = useState("");
	const [localError, setLocalError] = useState<string | null>(null);

	const isFeeding = reason === "feeding";

	const individualsQuery = useListIndividualsByAssetId({
		farmId,
		assetId: consumerAssetId,
		filters: { page: 1, pageSize: 100, status: "active" },
		enabled: !!farmId && isFeeding && !!consumerAssetId,
	});
	const consumerLabel = useMemo(() => {
		if (reason === "waste")
			return "El activo consumidor no esta permitido para desperdicio.";
		if (reason === "spoilage")
			return "El activo consumidor no esta permitido para descomposicion.";
		return "Selecciona el activo consumidor.";
	}, [reason]);

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		const parsedQuantity = Number(quantity);
		if (!Number.isFinite(parsedQuantity) || parsedQuantity <= 0) {
			setLocalError("La cantidad debe ser mayor a 0.");
			return;
		}
		if (!occurredAt) {
			setLocalError("La fecha y hora son obligatorias.");
			return;
		}
		if (isFeeding && !consumerAssetId) {
			setLocalError("La alimentacion requiere un activo consumidor.");
			return;
		}
		if (!isFeeding && consumerAssetId) {
			setLocalError(
				"Desperdicio y descomposicion no deben incluir un activo consumidor.",
			);
			return;
		}

		setLocalError(null);
		await onSubmit({
			material_asset_id: materialAssetId,
			consumer_asset_id: isFeeding ? Number(consumerAssetId) : null,
			individual_id:
				isFeeding && individualId.trim().length > 0
					? Number(individualId)
					: null,
			occurred_at: new Date(occurredAt).toISOString(),
			quantity: parsedQuantity,
			unit,
			reason,
			notes: notes.trim() || null,
			idempotency_key: crypto.randomUUID(),
		});
	};

	return (
		<form
			className="space-y-3"
			onSubmit={(event) => void handleSubmit(event)}
		>
			<div className="grid gap-3 md:grid-cols-2">
				<div className="space-y-1.5">
					<Label htmlFor="consumption-occurred-at">Fecha y hora</Label>
					<Input
						id="consumption-occurred-at"
						type="datetime-local"
						value={occurredAt}
						onChange={(event) => setOccurredAt(event.target.value)}
					/>
				</div>
				<div className="space-y-1.5">
					<Label htmlFor="consumption-unit">Unidad</Label>
					<Select
						value={unit}
						onValueChange={(value) => setUnit(value as LivestockEventUnit)}
					>
						<SelectTrigger
							id="consumption-unit"
							className="w-full"
						>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{EVENT_UNITS.map((eventUnit) => (
								<SelectItem
									key={eventUnit}
									value={eventUnit}
								>
									{eventUnit}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
				<div className="space-y-1.5">
					<Label htmlFor="consumption-quantity">Cantidad</Label>
					<Input
						id="consumption-quantity"
						type="number"
						min="0"
						step="0.01"
						value={quantity}
						onChange={(event) => setQuantity(event.target.value)}
					/>
				</div>
				<div className="space-y-1.5">
					<Label htmlFor="consumption-reason">Motivo</Label>
					<Select
						value={reason}
						onValueChange={(value) => {
							const nextReason = value as MaterialConsumptionReason;
							setReason(nextReason);
							if (nextReason !== "feeding") {
								setConsumerAssetId("");
								setIndividualId("");
							}
						}}
					>
						<SelectTrigger
							id="consumption-reason"
							className="w-full"
						>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="feeding">alimentacion</SelectItem>
							<SelectItem value="waste">desperdicio</SelectItem>
							<SelectItem value="spoilage">descomposicion</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>

			<div className="space-y-1.5">
				<Label htmlFor="consumption-consumer-asset">Activo consumidor</Label>
				<Select
					value={consumerAssetId || "none"}
					onValueChange={(value) => {
						setConsumerAssetId(value === "none" ? "" : value);
						setIndividualId("");
					}}
					disabled={!isFeeding}
				>
					<SelectTrigger
						id="consumption-consumer-asset"
						className="w-full"
					>
						<SelectValue placeholder="Selecciona un activo" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="none">Ninguno</SelectItem>
						{consumerAssets.map((asset) => (
							<SelectItem
								key={asset.id}
								value={String(asset.id)}
							>
								{asset.name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				<p className="text-xs text-(--v2-ink-soft)">{consumerLabel}</p>
			</div>

			<div className="space-y-1.5">
				<Label htmlFor="consumption-individual">Individual (opcional)</Label>
				<Select
					value={individualId || "none"}
					onValueChange={(value) =>
						setIndividualId(value === "none" ? "" : value)
					}
					disabled={!isFeeding || !consumerAssetId}
				>
					<SelectTrigger
						id="consumption-individual"
						className="w-full"
					>
						<SelectValue placeholder="Selecciona un individual" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="none">Ninguno</SelectItem>
						{(individualsQuery.data?.data ?? []).map((individual) => (
							<SelectItem
								key={individual.id}
								value={String(individual.id)}
							>
								{individual.name || individual.tag || `#${individual.id}`}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<div className="space-y-1.5">
				<Label htmlFor="consumption-notes">Notas (opcional)</Label>
				<Textarea
					id="consumption-notes"
					rows={2}
					value={notes}
					onChange={(event) => setNotes(event.target.value)}
				/>
			</div>

			{localError ? <p className="text-sm text-destructive">{localError}</p> : null}
			{errorMessage ? (
				<p className="text-sm text-destructive">{errorMessage}</p>
			) : null}

			<div className="flex justify-end">
				<Button
					type="submit"
					disabled={isSubmitting}
				>
					{isSubmitting ? "Registrando..." : "Registrar consumo"}
				</Button>
			</div>
		</form>
	);
}
