import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type { ILivestockIndividual } from "@/features/livestock/types/livestock-types";

/** Select needs a non-empty value, so "no sire" gets its own sentinel. */
export const NO_SIRE_VALUE = "none";

interface PregnancyProjectionFieldsProps {
	values: {
		offspringCount: string;
		serviceDate: string;
		expectedDueAt: string;
		sireId: string;
	};
	onChange: (
		field: keyof PregnancyProjectionFieldsProps["values"],
		value: string,
	) => void;
	sireCandidates: ILivestockIndividual[];
	/** Null when the flock has no gestation length — the due date is then manual. */
	gestationDays: number | null;
}

export function PregnancyProjectionFields({
	values,
	onChange,
	sireCandidates,
	gestationDays,
}: PregnancyProjectionFieldsProps) {
	return (
		<div className="space-y-3">
			<div className="grid gap-3 md:grid-cols-2">
				<div className="space-y-1.5">
					<Label htmlFor="pregnancy-offspring">Crías estimadas</Label>
					<Input
						id="pregnancy-offspring"
						type="number"
						min="0"
						step="1"
						value={values.offspringCount}
						onChange={(event) => onChange("offspringCount", event.target.value)}
					/>
				</div>
				<div className="space-y-1.5">
					<Label htmlFor="pregnancy-service-date">
						Fecha de servicio (opcional)
					</Label>
					<Input
						id="pregnancy-service-date"
						type="datetime-local"
						value={values.serviceDate}
						onChange={(event) => onChange("serviceDate", event.target.value)}
					/>
				</div>
			</div>

			<div className="grid gap-3 md:grid-cols-2">
				<div className="space-y-1.5">
					<Label htmlFor="pregnancy-due">
						Fecha estimada de parto (opcional)
					</Label>
					<Input
						id="pregnancy-due"
						type="datetime-local"
						value={values.expectedDueAt}
						onChange={(event) => onChange("expectedDueAt", event.target.value)}
					/>
					<p className="text-xs text-(--v2-ink-soft)">
						{gestationDays != null
							? `Si la dejas vacía se calcula sola: ${gestationDays} días desde la fecha de servicio (o la del control).`
							: "Este lote no tiene duración de gestación configurada, así que hay que escribirla a mano. Sin fecha, el control no aparece en próximos partos."}
					</p>
				</div>
				<div className="space-y-1.5">
					<Label htmlFor="pregnancy-sire">Padre (opcional)</Label>
					<Select
						value={values.sireId}
						onValueChange={(value) => onChange("sireId", value)}
					>
						<SelectTrigger
							id="pregnancy-sire"
							className="w-full"
						>
							<SelectValue placeholder="Sin registrar" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value={NO_SIRE_VALUE}>Sin registrar</SelectItem>
							{sireCandidates.map((candidate) => (
								<SelectItem
									key={candidate.id}
									value={String(candidate.id)}
								>
									{candidate.name ?? candidate.tag}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			</div>
		</div>
	);
}
