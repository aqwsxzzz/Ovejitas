import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUpdateLivestockAssetById } from "@/features/livestock/api/livestock-queries";

/** Backend sanity bounds (`GestationDays`) — wide enough for any farmed species. */
const MIN_GESTATION_DAYS = 20;
const MAX_GESTATION_DAYS = 400;

interface GestationLengthCardProps {
	farmId: string;
	assetId: number;
	gestationDays: number | null;
}

export function GestationLengthCard({
	farmId,
	assetId,
	gestationDays,
}: GestationLengthCardProps) {
	const [draft, setDraft] = useState(
		gestationDays != null ? String(gestationDays) : "",
	);
	const [error, setError] = useState<string | null>(null);
	const updateAsset = useUpdateLivestockAssetById();

	const handleSave = async () => {
		const trimmed = draft.trim();
		// An empty field clears the length: checks stop deriving a due date
		// rather than deriving one from a stale number.
		const parsed = trimmed === "" ? null : Number(trimmed);

		if (
			parsed !== null &&
			(!Number.isInteger(parsed) ||
				parsed < MIN_GESTATION_DAYS ||
				parsed > MAX_GESTATION_DAYS)
		) {
			setError(
				`Ingresa un numero entero entre ${MIN_GESTATION_DAYS} y ${MAX_GESTATION_DAYS} dias.`,
			);
			return;
		}

		setError(null);
		try {
			await updateAsset.mutateAsync({
				farmId,
				assetId,
				data: { gestation_days: parsed },
			});
		} catch {
			setError("No se pudo guardar la duracion de gestacion.");
		}
	};

	const isUnchanged =
		draft.trim() === (gestationDays != null ? String(gestationDays) : "");

	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-base">Duracion de gestacion</CardTitle>
			</CardHeader>
			<CardContent className="space-y-3">
				<p className="text-sm text-(--v2-ink-soft)">
					Con este dato, un chequeo de prenez calcula solo la fecha probable de
					parto. Sin el, hay que escribirla a mano en cada chequeo.
				</p>
				<div className="space-y-1.5">
					<Label htmlFor={`gestation-${assetId}`}>Dias de gestacion</Label>
					<Input
						id={`gestation-${assetId}`}
						type="number"
						inputMode="numeric"
						min={MIN_GESTATION_DAYS}
						max={MAX_GESTATION_DAYS}
						placeholder="Ej: 147 para ovejas, 283 para vacas"
						value={draft}
						onChange={(event) => setDraft(event.target.value)}
					/>
				</div>
				{error ? (
					<p
						role="alert"
						className="text-sm text-destructive"
					>
						{error}
					</p>
				) : null}
				<Button
					type="button"
					onClick={handleSave}
					disabled={updateAsset.isPending || isUnchanged}
				>
					{updateAsset.isPending ? "Guardando..." : "Guardar"}
				</Button>
			</CardContent>
		</Card>
	);
}
