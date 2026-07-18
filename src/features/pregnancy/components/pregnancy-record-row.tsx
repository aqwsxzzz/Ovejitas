import { useState } from "react";

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
import {
	useDeletePregnancy,
	useUpdatePregnancy,
} from "@/features/pregnancy/api/pregnancy-queries";
import type { IPregnancyRead } from "@/features/pregnancy/types/pregnancy-types";

interface PregnancyRecordRowProps {
	farmId: string;
	record: IPregnancyRead;
}

const toLocalInput = (iso: string | null): string =>
	iso ? new Date(iso).toISOString().slice(0, 16) : "";

const formatDate = (iso: string | null): string =>
	iso ? new Date(iso).toLocaleDateString("es") : "—";

export function PregnancyRecordRow({ farmId, record }: PregnancyRecordRowProps) {
	const [isEditing, setIsEditing] = useState(false);
	const [occurredAt, setOccurredAt] = useState(toLocalInput(record.occurred_at));
	const [isPregnant, setIsPregnant] = useState(record.is_pregnant);
	const [offspringCount, setOffspringCount] = useState(
		record.offspring_count != null ? String(record.offspring_count) : "",
	);
	const [expectedDueAt, setExpectedDueAt] = useState(
		toLocalInput(record.expected_due_at),
	);
	const [notes, setNotes] = useState(record.notes ?? "");

	const updateMutation = useUpdatePregnancy();
	const deleteMutation = useDeletePregnancy();

	const handleSave = async () => {
		await updateMutation.mutateAsync({
			farmId,
			pregnancyId: record.id,
			data: {
				occurred_at: occurredAt ? new Date(occurredAt).toISOString() : undefined,
				is_pregnant: isPregnant,
				offspring_count:
					isPregnant && offspringCount ? Number(offspringCount) : null,
				expected_due_at:
					isPregnant && expectedDueAt
						? new Date(expectedDueAt).toISOString()
						: null,
				notes: notes.trim() || null,
			},
		});
		setIsEditing(false);
	};

	if (!isEditing) {
		return (
			<div className="flex items-center justify-between gap-3 rounded-lg border px-4 py-3 text-sm">
				<div className="min-w-0">
					<p className="font-medium">
						Individuo #{record.individual_id} ·{" "}
						{record.is_pregnant ? "Preñada" : "No preñada"}
					</p>
					<p className="text-(--v2-ink-soft)">
						Control: {formatDate(record.occurred_at)}
						{record.is_pregnant
							? ` · Parto est.: ${formatDate(record.expected_due_at)}${
									record.offspring_count != null
										? ` · ${record.offspring_count} crías`
										: ""
								}`
							: ""}
					</p>
				</div>
				<div className="flex items-center gap-2">
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={() => setIsEditing(true)}
					>
						Editar
					</Button>
					<Button
						type="button"
						variant="outline"
						size="sm"
						className="text-destructive hover:text-destructive"
						disabled={deleteMutation.isPending}
						onClick={() =>
							void deleteMutation.mutateAsync({
								farmId,
								pregnancyId: record.id,
							})
						}
					>
						Eliminar
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-3 rounded-lg border px-4 py-3">
			<div className="grid gap-3 md:grid-cols-2">
				<div className="space-y-1.5">
					<Label htmlFor={`occurred-${record.id}`}>Fecha del control</Label>
					<Input
						id={`occurred-${record.id}`}
						type="datetime-local"
						value={occurredAt}
						onChange={(event) => setOccurredAt(event.target.value)}
					/>
				</div>
				<div className="space-y-1.5">
					<Label htmlFor={`result-${record.id}`}>Resultado</Label>
					<Select
						value={isPregnant ? "yes" : "no"}
						onValueChange={(value) => setIsPregnant(value === "yes")}
					>
						<SelectTrigger id={`result-${record.id}`} className="w-full">
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
						<Label htmlFor={`offspring-${record.id}`}>Crías estimadas</Label>
						<Input
							id={`offspring-${record.id}`}
							type="number"
							min="0"
							step="1"
							value={offspringCount}
							onChange={(event) => setOffspringCount(event.target.value)}
						/>
					</div>
					<div className="space-y-1.5">
						<Label htmlFor={`due-${record.id}`}>Fecha estimada de parto</Label>
						<Input
							id={`due-${record.id}`}
							type="datetime-local"
							value={expectedDueAt}
							onChange={(event) => setExpectedDueAt(event.target.value)}
						/>
					</div>
				</div>
			) : null}

			<div className="space-y-1.5">
				<Label htmlFor={`notes-${record.id}`}>Notas</Label>
				<Input
					id={`notes-${record.id}`}
					value={notes}
					onChange={(event) => setNotes(event.target.value)}
				/>
			</div>

			<div className="flex justify-end gap-2">
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={() => setIsEditing(false)}
				>
					Cancelar
				</Button>
				<Button
					type="button"
					size="sm"
					disabled={updateMutation.isPending}
					onClick={() => void handleSave()}
				>
					{updateMutation.isPending ? "Guardando..." : "Guardar"}
				</Button>
			</div>
		</div>
	);
}
