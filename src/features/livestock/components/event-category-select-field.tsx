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
import type {
	ILivestockEventCategory,
	LivestockEventType,
} from "@/features/livestock/types/livestock-types";

/** Radix Select forbids empty-string item values; use sentinels for special rows. */
const NEW_OPTION_VALUE = "__new__";
const NONE_OPTION_VALUE = "__none__";
const DEFAULT_COLOR = "#f2df77";

export interface CreateEventCategoryInput {
	type: LivestockEventType;
	name: string;
	color?: string;
}

interface EventCategorySelectFieldProps {
	/** Event type these categories belong to; used to filter and to create new ones. */
	type: LivestockEventType;
	/** Full or pre-filtered category list; filtered by `type` internally. */
	categories: ILivestockEventCategory[];
	/** Selected category id as a string; "" means none selected. */
	value: string;
	onChange: (categoryId: string) => void;
	label: string;
	placeholder?: string;
	/** Offer a "no category" option (not appropriate when a category is required). */
	allowNone?: boolean;
	/** Label for the inline-create row, e.g. "Nueva categoria" / "Nuevo producto". */
	newOptionLabel: string;
	helperText?: React.ReactNode;
	disabled?: boolean;
	/** When absent, the inline-create row is hidden. */
	onCreateEventCategory?: (input: CreateEventCategoryInput) => Promise<number>;
}

export function EventCategorySelectField({
	type,
	categories,
	value,
	onChange,
	label,
	placeholder,
	allowNone = false,
	newOptionLabel,
	helperText,
	disabled = false,
	onCreateEventCategory,
}: EventCategorySelectFieldProps) {
	const [isCreating, setIsCreating] = useState(false);
	const [newName, setNewName] = useState("");
	const [newColor, setNewColor] = useState(DEFAULT_COLOR);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState("");

	const availableCategories = categories.filter(
		(category) => category.type === type,
	);
	const selectValue = isCreating ? NEW_OPTION_VALUE : value || undefined;

	const handleValueChange = (next: string) => {
		if (next === NEW_OPTION_VALUE) {
			setIsCreating(true);
			return;
		}
		setIsCreating(false);
		onChange(next === NONE_OPTION_VALUE ? "" : next);
	};

	const handleCreate = async () => {
		setError("");
		if (!onCreateEventCategory) return;
		if (!newName.trim()) {
			setError("Escribe un nombre.");
			return;
		}
		setIsSubmitting(true);
		try {
			const createdId = await onCreateEventCategory({
				type,
				name: newName.trim(),
				color: newColor,
			});
			onChange(String(createdId));
			setNewName("");
			setIsCreating(false);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="space-y-1">
			<Label>{label}</Label>
			<Select value={selectValue} onValueChange={handleValueChange}>
				<SelectTrigger className="w-full">
					<SelectValue placeholder={placeholder ?? "Selecciona"} />
				</SelectTrigger>
				<SelectContent>
					{allowNone ? (
						<SelectItem value={NONE_OPTION_VALUE}>Sin categoria</SelectItem>
					) : null}
					{availableCategories.map((category) => (
						<SelectItem key={category.id} value={String(category.id)}>
							{category.name}
						</SelectItem>
					))}
					{onCreateEventCategory ? (
						<SelectItem value={NEW_OPTION_VALUE}>{newOptionLabel}</SelectItem>
					) : null}
				</SelectContent>
			</Select>
			{helperText ? (
				<p className="text-xs text-muted-foreground">{helperText}</p>
			) : null}
			{isCreating ? (
				<div className="grid gap-2 rounded-lg border bg-muted/40 p-2">
					<div className="space-y-1">
						<Label htmlFor="new-category-name">Nombre</Label>
						<Input
							id="new-category-name"
							type="text"
							value={newName}
							onChange={(event) => setNewName(event.target.value)}
							placeholder="Ej: Huevos"
						/>
					</div>
					<div className="space-y-1">
						<Label htmlFor="new-category-color">Color</Label>
						<Input
							id="new-category-color"
							type="color"
							value={newColor}
							onChange={(event) => setNewColor(event.target.value)}
							className="h-10 px-1 py-1"
						/>
					</div>
					{error ? <p className="text-sm text-destructive">{error}</p> : null}
					<div className="flex justify-end">
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={() => void handleCreate()}
							disabled={isSubmitting || disabled}
						>
							{isSubmitting ? "Creando..." : "Crear"}
						</Button>
					</div>
				</div>
			) : null}
		</div>
	);
}
