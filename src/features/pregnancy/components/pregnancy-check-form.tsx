import { useState } from "react";
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
import { useCreatePregnancy } from "@/features/pregnancy/api/pregnancy-queries";

interface PregnancyCheckFormProps {
	farmId: string;
	individualId: number;
}

export function PregnancyCheckForm({
	farmId,
	individualId,
}: PregnancyCheckFormProps) {
	const [occurredAt, setOccurredAt] = useState(
		new Date().toISOString().slice(0, 16),
	);
	const [isPregnant, setIsPregnant] = useState(false);
	const [offspringCount, setOffspringCount] = useState("");
	const [expectedDueAt, setExpectedDueAt] = useState("");
	const [notes, setNotes] = useState("");
	const [localError, setLocalError] = useState<string | null>(null);

	const createPregnancyMutation = useCreatePregnancy();

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!farmId || !occurredAt) {
			setLocalError("La fecha del control es obligatoria.");
			return;
		}

		const parsedCount = Number(offspringCount);
		setLocalError(null);

		try {
			await createPregnancyMutation.mutateAsync({
				farmId,
				data: {
					individual_id: individualId,
					occurred_at: new Date(occurredAt).toISOString(),
					is_pregnant: isPregnant,
					offspring_count:
						isPregnant && offspringCount ? parsedCount : undefined,
					expected_due_at:
						isPregnant && expectedDueAt
							? new Date(expectedDueAt).toISOString()
							: undefined,
					notes: notes.trim() || undefined,
					idempotency_key: crypto.randomUUID(),
				},
			});
			setOffspringCount("");
			setExpectedDueAt("");
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
						<div className="grid gap-3 md:grid-cols-2">
							<div className="space-y-1.5">
								<Label htmlFor="pregnancy-offspring">Crías estimadas</Label>
								<Input
									id="pregnancy-offspring"
									type="number"
									min="0"
									step="1"
									value={offspringCount}
									onChange={(event) => setOffspringCount(event.target.value)}
								/>
							</div>
							<div className="space-y-1.5">
								<Label htmlFor="pregnancy-due">Fecha estimada de parto</Label>
								<Input
									id="pregnancy-due"
									type="datetime-local"
									value={expectedDueAt}
									onChange={(event) => setExpectedDueAt(event.target.value)}
								/>
							</div>
						</div>
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
