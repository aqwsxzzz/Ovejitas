import { useCallback, useState } from "react";
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
import type {
	ILivestockIndividual,
	IndividualSex,
} from "@/features/livestock/types/livestock-types";

/** Radix Select forbids empty-string item values; use a sentinel for "none". */
const NONE = "__none__";

interface IndividualFormProps {
	/** Individual to edit, or undefined for create mode */
	individual?: ILivestockIndividual;
	/** List of available individuals to select as parents */
	availableParents?: ILivestockIndividual[];
	/** Callback when form is submitted */
	onSubmit: (data: IndividualFormData) => Promise<void>;
	/** Callback to cancel/close form */
	onCancel?: () => void;
	isLoading?: boolean;
}

export interface IndividualFormData {
	name?: string;
	tag: string;
	sex?: IndividualSex;
	birthDate?: string;
	status?: "active" | "sold" | "deceased";
	motherId?: string;
	fatherId?: string;
}

export function IndividualForm({
	individual,
	availableParents = [],
	onSubmit,
	onCancel,
	isLoading = false,
}: IndividualFormProps) {
	const isEditMode = !!individual;

	const [formData, setFormData] = useState<IndividualFormData>({
		name: individual?.name ?? "",
		tag: individual?.tag ?? "",
		sex: individual?.extra?.sex as IndividualSex | undefined,
		birthDate: individual?.birth_date ?? undefined,
		status:
			(individual?.status as "active" | "sold" | "deceased" | undefined) ??
			"active",
		motherId:
			individual?.mother_id != null ? String(individual.mother_id) : undefined,
		fatherId:
			individual?.father_id != null ? String(individual.father_id) : undefined,
	});

	const [error, setError] = useState<string | null>(null);

	type IndividualFormFieldValue =
		| string
		| IndividualSex
		| IndividualFormData["status"]
		| undefined;

	const handleChange = useCallback(
		(field: keyof IndividualFormData, value: IndividualFormFieldValue) => {
			setFormData((prev) => ({ ...prev, [field]: value || undefined }));
			setError(null);
		},
		[],
	);

	const validateForm = (): boolean => {
		// Tag is required
		if (!formData.tag?.trim()) {
			setError("El identificador es obligatorio");
			return false;
		}

		// Can't set self as parent (only in edit mode)
		if (isEditMode && individual) {
			if (
				formData.motherId === String(individual.id) ||
				formData.fatherId === String(individual.id)
			) {
				setError("Un individuo no puede ser su propio progenitor");
				return false;
			}

			// Can't set same individual as mother and father
			if (formData.motherId && formData.motherId === formData.fatherId) {
				setError("Madre y padre no pueden ser el mismo individuo");
				return false;
			}
		}

		return true;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateForm()) {
			return;
		}

		try {
			await onSubmit(formData);
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "No se pudo guardar el individuo",
			);
		}
	};

	const parentOptions = availableParents.filter(
		(p) => !isEditMode || p.id !== individual?.id,
	);

	const motherOptions = parentOptions.filter(
		(p) => (p.extra?.sex as string | undefined) !== "male",
	);
	const fatherOptions = parentOptions.filter(
		(p) => (p.extra?.sex as string | undefined) !== "female",
	);

	return (
		<form
			onSubmit={handleSubmit}
			className="space-y-4"
		>
			{error && (
				<div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
					{error}
				</div>
			)}

			{/* Name */}
			<div className="space-y-1">
				<Label htmlFor="individual-name">Nombre</Label>
				<Input
					id="individual-name"
					value={formData.name ?? ""}
					onChange={(e) => handleChange("name", e.target.value || undefined)}
					placeholder="Nombre opcional"
				/>
			</div>

			{/* Tag (Required) */}
			<div className="space-y-1">
				<Label htmlFor="individual-tag">
					Identificador <span className="text-destructive">*</span>
				</Label>
				<Input
					id="individual-tag"
					value={formData.tag}
					onChange={(e) => handleChange("tag", e.target.value)}
					placeholder="Ej: SH-001, CT-042"
				/>
			</div>

			{/* Sex */}
			<div className="space-y-1">
				<Label htmlFor="individual-sex">Sexo</Label>
				<Select
					value={formData.sex ?? NONE}
					onValueChange={(value) =>
						handleChange("sex", value === NONE ? undefined : value)
					}
				>
					<SelectTrigger id="individual-sex">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value={NONE}>Desconocido</SelectItem>
						<SelectItem value="male">Macho ♂</SelectItem>
						<SelectItem value="female">Hembra ♀</SelectItem>
					</SelectContent>
				</Select>
			</div>

			{/* Birth Date */}
			<div className="space-y-1">
				<Label htmlFor="individual-birth-date">Fecha de nacimiento</Label>
				<Input
					id="individual-birth-date"
					type="date"
					value={formData.birthDate ?? ""}
					onChange={(e) =>
						handleChange("birthDate", e.target.value || undefined)
					}
				/>
			</div>

			{/* Mother */}
			<div className="space-y-1">
				<Label htmlFor="individual-mother">Madre</Label>
				<Select
					value={formData.motherId ?? NONE}
					onValueChange={(value) =>
						handleChange("motherId", value === NONE ? undefined : value)
					}
				>
					<SelectTrigger id="individual-mother">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value={NONE}>Sin madre</SelectItem>
						{motherOptions.map((option) => (
							<SelectItem
								key={option.id}
								value={String(option.id)}
							>
								{option.name || option.tag}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			{/* Father */}
			<div className="space-y-1">
				<Label htmlFor="individual-father">Padre</Label>
				<Select
					value={formData.fatherId ?? NONE}
					onValueChange={(value) =>
						handleChange("fatherId", value === NONE ? undefined : value)
					}
				>
					<SelectTrigger id="individual-father">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value={NONE}>Sin padre</SelectItem>
						{fatherOptions.map((option) => (
							<SelectItem
								key={option.id}
								value={String(option.id)}
							>
								{option.name || option.tag}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			{/* Status (only show in edit mode) */}
			{isEditMode && (
				<div className="space-y-1">
					<Label htmlFor="individual-status">Estado</Label>
					<Select
						value={formData.status ?? "active"}
						onValueChange={(value) =>
							handleChange("status", value as IndividualFormData["status"])
						}
					>
						<SelectTrigger id="individual-status">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="active">Activo</SelectItem>
							<SelectItem value="sold">Vendido</SelectItem>
							<SelectItem value="deceased">Fallecido</SelectItem>
						</SelectContent>
					</Select>
				</div>
			)}

			{/* Submit & Cancel */}
			<div className="flex gap-2 pt-2">
				<Button
					type="submit"
					variant="default"
					disabled={isLoading}
					className="flex-1"
				>
					{isLoading ? "Guardando..." : isEditMode ? "Actualizar" : "Crear"}
				</Button>
				{onCancel && (
					<Button
						type="button"
						variant="outline"
						onClick={onCancel}
						disabled={isLoading}
						className="flex-1"
					>
						Cancelar
					</Button>
				)}
			</div>
		</form>
	);
}
