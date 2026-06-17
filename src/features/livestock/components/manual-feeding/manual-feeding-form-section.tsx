import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { EVENT_UNITS } from "@/shared/types/unit-types";

import type { ManualFeedingFormState } from "./types";

interface MaterialOption {
	id: number;
	name: string;
}

interface ManualFeedingFormSectionProps {
	form: ManualFeedingFormState;
	materialOptions: MaterialOption[];
	isLoadingMaterials: boolean;
	onFieldChange: <K extends keyof ManualFeedingFormState>(
		field: K,
		value: ManualFeedingFormState[K],
	) => void;
}

export function ManualFeedingFormSection({
	form,
	materialOptions,
	isLoadingMaterials,
	onFieldChange,
}: ManualFeedingFormSectionProps) {
	return (
		<div className="grid gap-3 md:grid-cols-3">
			<div className="space-y-1.5 md:col-span-2">
				<Label htmlFor="manual-feeding-material">Material asignado</Label>
				<Select
					value={form.materialAssetId || "none"}
					onValueChange={(value) => {
						onFieldChange("materialAssetId", value === "none" ? "" : value);
					}}
				>
					<SelectTrigger
						id="manual-feeding-material"
						className="w-full"
					>
						<SelectValue placeholder="Selecciona un material" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="none">Ninguno</SelectItem>
						{materialOptions.map((material) => (
							<SelectItem
								key={material.id}
								value={String(material.id)}
							>
								{material.name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				{isLoadingMaterials ? (
					<p className="text-xs text-(--v2-ink-soft)">Cargando materiales...</p>
				) : null}
			</div>

			<div className="space-y-1.5">
				<Label htmlFor="manual-feeding-unit">Unidad</Label>
				<Select
					value={form.unit}
					onValueChange={(value) => {
						onFieldChange("unit", value as ManualFeedingFormState["unit"]);
					}}
				>
					<SelectTrigger
						id="manual-feeding-unit"
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
				<Label htmlFor="manual-feeding-qty">Cantidad</Label>
				<Input
					id="manual-feeding-qty"
					type="number"
					min="0"
					step="0.01"
					value={form.quantity}
					onChange={(event) => {
						onFieldChange("quantity", event.target.value);
					}}
				/>
			</div>
		</div>
	);
}
