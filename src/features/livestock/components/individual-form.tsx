import { useCallback, useState } from "react";
import type {
	ILivestockIndividual,
	IndividualSex,
} from "@/features/livestock/types/livestock-types";

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
			setError("Tag is required");
			return false;
		}

		// Can't set self as parent (only in edit mode)
		if (isEditMode && individual) {
			if (
				formData.motherId === String(individual.id) ||
				formData.fatherId === String(individual.id)
			) {
				setError("An individual cannot be their own parent");
				return false;
			}

			// Can't set same individual as mother and father
			if (formData.motherId && formData.motherId === formData.fatherId) {
				setError("Mother and father cannot be the same individual");
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
				err instanceof Error ? err.message : "Failed to save individual",
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
				<div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
					{error}
				</div>
			)}

			{/* Name */}
			<div>
				<label className="block text-sm font-medium text-gray-700">Name</label>
				<input
					type="text"
					value={formData.name ?? ""}
					onChange={(e) => handleChange("name", e.target.value || undefined)}
					placeholder="Optional name"
					className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
				/>
			</div>

			{/* Tag (Required) */}
			<div>
				<label className="block text-sm font-medium text-gray-700">
					Tag <span className="text-red-600">*</span>
				</label>
				<input
					type="text"
					value={formData.tag}
					onChange={(e) => handleChange("tag", e.target.value)}
					placeholder="e.g., SH-001, CT-042"
					className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
				/>
			</div>

			{/* Sex */}
			<div>
				<label className="block text-sm font-medium text-gray-700">Sex</label>
				<select
					value={formData.sex ?? ""}
					onChange={(e) => handleChange("sex", e.target.value || undefined)}
					className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
				>
					<option value="">Unknown</option>
					<option value="male">Male ♂</option>
					<option value="female">Female ♀</option>
				</select>
			</div>

			{/* Birth Date */}
			<div>
				<label className="block text-sm font-medium text-gray-700">
					Birth Date
				</label>
				<input
					type="date"
					value={formData.birthDate ?? ""}
					onChange={(e) =>
						handleChange("birthDate", e.target.value || undefined)
					}
					className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
				/>
			</div>

			{/* Mother */}
			<div>
				<label className="block text-sm font-medium text-gray-700">
					Mother
				</label>
				<select
					value={formData.motherId ?? ""}
					onChange={(e) =>
						handleChange("motherId", e.target.value || undefined)
					}
					className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
				>
					<option value="">None</option>
					{motherOptions.map((individual) => (
						<option
							key={individual.id}
							value={individual.id}
						>
							{individual.name || individual.tag}
						</option>
					))}
				</select>
			</div>

			{/* Father */}
			<div>
				<label className="block text-sm font-medium text-gray-700">
					Father
				</label>
				<select
					value={formData.fatherId ?? ""}
					onChange={(e) =>
						handleChange("fatherId", e.target.value || undefined)
					}
					className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
				>
					<option value="">None</option>
					{fatherOptions.map((individual) => (
						<option
							key={individual.id}
							value={individual.id}
						>
							{individual.name || individual.tag}
						</option>
					))}
				</select>
			</div>

			{/* Status (only show in edit mode) */}
			{isEditMode && (
				<div>
					<label className="block text-sm font-medium text-gray-700">
						Status
					</label>
					<select
						value={formData.status ?? "active"}
						onChange={(e) =>
							handleChange(
								"status",
								e.target.value as IndividualFormData["status"],
							)
						}
						className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
					>
						<option value="active">Active</option>
						<option value="sold">Sold</option>
						<option value="deceased">Deceased</option>
					</select>
				</div>
			)}

			{/* Submit & Cancel */}
			<div className="flex gap-2 pt-2">
				<button
					type="submit"
					disabled={isLoading}
					className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
				>
					{isLoading ? "Saving..." : isEditMode ? "Update" : "Create"}
				</button>
				{onCancel && (
					<button
						type="button"
						onClick={onCancel}
						disabled={isLoading}
						className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
					>
						Cancel
					</button>
				)}
			</div>
		</form>
	);
}
