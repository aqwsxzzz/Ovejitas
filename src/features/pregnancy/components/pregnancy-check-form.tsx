import { useState } from "react";

import { toDateTimeLocalValue } from "@/lib/datetime";
import type { FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import type { ILivestockIndividual } from "@/features/livestock/types/livestock-types";
import { useCreatePregnancy } from "@/features/pregnancy/api/pregnancy-queries";

import {
	NO_SIRE_VALUE,
	PregnancyProjectionFields,
} from "./pregnancy-projection-fields";

const EMPTY_PROJECTION = {
	offspringCount: "",
	serviceDate: "",
	expectedDueAt: "",
	sireId: NO_SIRE_VALUE,
};

interface PregnancyCheckFormProps {
	farmId: string;
	individualId: number;
	/**
	 * Individuals in the same asset, minus this one. Scoped to the asset because
	 * the backend only lists individuals per asset — a sire kept in a separate
	 * lot cannot be selected yet.
	 */
	sireCandidates: ILivestockIndividual[];
	gestationDays: number | null;
}

export function PregnancyCheckForm({
	farmId,
	individualId,
	sireCandidates,
	gestationDays,
}: PregnancyCheckFormProps) {
	const [occurredAt, setOccurredAt] = useState(
		toDateTimeLocalValue(),
	);
	const [isPregnant, setIsPregnant] = useState(false);
	const [projection, setProjection] = useState(EMPTY_PROJECTION);
	const [notes, setNotes] = useState("");
	const [localError, setLocalError] = useState<string | null>(null);

	const createPregnancyMutation = useCreatePregnancy();

	const updateProjection = (
		field: keyof typeof EMPTY_PROJECTION,
		value: string,
	) => setProjection((current) => ({ ...current, [field]: value }));

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!farmId || !occurredAt) {
			setLocalError("La fecha del control es obligatoria.");
			return;
		}

		setLocalError(null);

		// A not-pregnant check must carry no projection at all (backend rejects
		// an offspring count or due date on one). Omitting expected_due_at on a
		// positive check is what asks the backend to derive it.
		const { offspringCount, serviceDate, expectedDueAt, sireId } = projection;
		try {
			await createPregnancyMutation.mutateAsync({
				farmId,
				data: {
					individual_id: individualId,
					occurred_at: new Date(occurredAt).toISOString(),
					is_pregnant: isPregnant,
					offspring_count:
						isPregnant && offspringCount ? Number(offspringCount) : undefined,
					expected_due_at:
						isPregnant && expectedDueAt
							? new Date(expectedDueAt).toISOString()
							: undefined,
					service_date:
						isPregnant && serviceDate
							? new Date(serviceDate).toISOString()
							: undefined,
					sire_individual_id:
						isPregnant && sireId !== NO_SIRE_VALUE ? Number(sireId) : undefined,
					notes: notes.trim() || undefined,
					idempotency_key: crypto.randomUUID(),
				},
			});
			setProjection(EMPTY_PROJECTION);
			setNotes("");
		} catch {
			setLocalError(
				"No se pudo registrar el control de preñez. Intenta de nuevo.",
			);
		}
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Registrar control de preñez</CardTitle>
			</CardHeader>
			<CardContent>
				<form
					className="space-y-3"
					onSubmit={(event) => void handleSubmit(event)}
				>
					<div className="grid gap-3 md:grid-cols-2">
						<div className="space-y-1.5">
							<Label htmlFor="pregnancy-occurred-at">Fecha del control</Label>
							<Input
								id="pregnancy-occurred-at"
								type="datetime-local"
								value={occurredAt}
								onChange={(event) => setOccurredAt(event.target.value)}
							/>
						</div>
						<div className="space-y-1.5">
							<Label htmlFor="pregnancy-result">Resultado</Label>
							<Select
								value={isPregnant ? "yes" : "no"}
								onValueChange={(value) => setIsPregnant(value === "yes")}
							>
								<SelectTrigger
									id="pregnancy-result"
									className="w-full"
								>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="yes">Preñada</SelectItem>
									<SelectItem value="no">No preñada</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>

					{isPregnant ? (
						<PregnancyProjectionFields
							values={projection}
							onChange={updateProjection}
							sireCandidates={sireCandidates}
							gestationDays={gestationDays}
						/>
					) : null}

					<div className="space-y-1.5">
						<Label htmlFor="pregnancy-notes">Notas (opcional)</Label>
						<Textarea
							id="pregnancy-notes"
							rows={2}
							value={notes}
							onChange={(event) => setNotes(event.target.value)}
						/>
					</div>

					{localError ? (
						<p className="text-sm text-destructive">{localError}</p>
					) : null}

					<div className="flex justify-end">
						<Button
							type="submit"
							disabled={createPregnancyMutation.isPending}
						>
							{createPregnancyMutation.isPending
								? "Registrando..."
								: "Registrar control"}
						</Button>
					</div>
				</form>
			</CardContent>
		</Card>
	);
}
