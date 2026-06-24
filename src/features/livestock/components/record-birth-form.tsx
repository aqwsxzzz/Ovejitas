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
import { useCreateBirthByMotherId } from "@/features/livestock/api/livestock-queries";
import type { ILivestockIndividual } from "@/features/livestock/types/livestock-types";

interface RecordBirthFormProps {
	farmId: string;
	assetId: string;
	motherId: number;
	/** Possible fathers — other individuals under the same asset. */
	candidateParents: ILivestockIndividual[];
}

interface OffspringRow {
	id: string;
	tag: string;
	name: string;
	birthDate: string;
}

const emptyOffspring = (): OffspringRow => ({
	id: crypto.randomUUID(),
	tag: "",
	name: "",
	birthDate: "",
});

export function RecordBirthForm({
	farmId,
	assetId,
	motherId,
	candidateParents,
}: RecordBirthFormProps) {
	const [occurredAt, setOccurredAt] = useState(
		new Date().toISOString().slice(0, 16),
	);
	const [fatherId, setFatherId] = useState("none");
	const [notes, setNotes] = useState("");
	const [offspring, setOffspring] = useState<OffspringRow[]>([emptyOffspring()]);
	const [localError, setLocalError] = useState<string | null>(null);

	const createBirthMutation = useCreateBirthByMotherId();

	const updateOffspring = (id: string, patch: Partial<OffspringRow>) => {
		setOffspring((rows) =>
			rows.map((row) => (row.id === id ? { ...row, ...patch } : row)),
		);
	};

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const valid = offspring.filter((row) => row.tag.trim());
		if (valid.length === 0) {
			setLocalError("Agrega al menos una cría con su identificador (tag).");
			return;
		}

		setLocalError(null);
		try {
			await createBirthMutation.mutateAsync({
				farmId,
				assetId,
				motherId,
				data: {
					occurred_at: occurredAt ? new Date(occurredAt).toISOString() : undefined,
					father_id: fatherId !== "none" ? Number(fatherId) : undefined,
					notes: notes.trim() || undefined,
					offspring: valid.map((row) => ({
						tag: row.tag.trim(),
						name: row.name.trim() || undefined,
						birth_date: row.birthDate || undefined,
					})),
				},
			});
			setOffspring([emptyOffspring()]);
			setNotes("");
		} catch {
			setLocalError("No se pudo registrar el nacimiento. Intenta de nuevo.");
		}
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Registrar nacimiento</CardTitle>
			</CardHeader>
			<CardContent>
				<form
					className="space-y-3"
					onSubmit={(event) => void handleSubmit(event)}
				>
					<div className="grid gap-3 md:grid-cols-2">
						<div className="space-y-1.5">
							<Label htmlFor="birth-occurred-at">Fecha del parto</Label>
							<Input
								id="birth-occurred-at"
								type="datetime-local"
								value={occurredAt}
								onChange={(event) => setOccurredAt(event.target.value)}
							/>
						</div>
						<div className="space-y-1.5">
							<Label htmlFor="birth-father">Padre (opcional)</Label>
							<Select
								value={fatherId}
								onValueChange={setFatherId}
							>
								<SelectTrigger
									id="birth-father"
									className="w-full"
								>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="none">Sin registrar</SelectItem>
									{candidateParents.map((parent) => (
										<SelectItem
											key={parent.id}
											value={String(parent.id)}
										>
											{parent.tag ?? parent.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>

					<div className="space-y-2">
						<Label>Crías</Label>
						{offspring.map((row) => (
							<div
								key={row.id}
								className="grid gap-2 md:grid-cols-[1fr_1fr_1fr_auto]"
							>
								<Input
									value={row.tag}
									onChange={(event) =>
										updateOffspring(row.id, { tag: event.target.value })
									}
									placeholder="Identificador (tag)"
								/>
								<Input
									value={row.name}
									onChange={(event) =>
										updateOffspring(row.id, { name: event.target.value })
									}
									placeholder="Nombre (opcional)"
								/>
								<Input
									type="date"
									value={row.birthDate}
									onChange={(event) =>
										updateOffspring(row.id, { birthDate: event.target.value })
									}
								/>
								<Button
									type="button"
									variant="outline"
									size="icon"
									className="size-9 rounded-full"
									disabled={offspring.length === 1}
									onClick={() =>
										setOffspring((rows) =>
											rows.filter((candidate) => candidate.id !== row.id),
										)
									}
									aria-label="Quitar cría"
								>
									<span aria-hidden="true">×</span>
								</Button>
							</div>
						))}
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={() => setOffspring((rows) => [...rows, emptyOffspring()])}
						>
							Agregar cría
						</Button>
					</div>

					<div className="space-y-1.5">
						<Label htmlFor="birth-notes">Notas (opcional)</Label>
						<Textarea
							id="birth-notes"
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
							disabled={createBirthMutation.isPending}
						>
							{createBirthMutation.isPending
								? "Registrando..."
								: "Registrar nacimiento"}
						</Button>
					</div>
				</form>
			</CardContent>
		</Card>
	);
}
