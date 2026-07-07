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
	EventCategorySelectField,
	type CreateEventCategoryInput,
} from "@/features/livestock/components/event-category-select-field";
import type { ILivestockEventCategory } from "@/features/livestock/types/livestock-types";
import type {
	ProductionTargetBasis,
	ProductionTargetPeriod,
} from "@/features/livestock/types/production-targets-types";

import type { AddTargetInput } from "./use-asset-production-targets";
import { todayISODate } from "./production-targets-utils";

interface ProductionTargetFormProps {
	categories: ILivestockEventCategory[];
	disabled: boolean;
	onAdd: (input: AddTargetInput) => void;
	onCreateCategory: (input: CreateEventCategoryInput) => Promise<number>;
}

export function ProductionTargetForm({
	categories,
	disabled,
	onAdd,
	onCreateCategory,
}: ProductionTargetFormProps) {
	const [categoryId, setCategoryId] = useState("");
	const [basis, setBasis] = useState<ProductionTargetBasis>(
		"per_head_continuous",
	);
	const [period, setPeriod] = useState<ProductionTargetPeriod | "none">("day");
	const [rate, setRate] = useState("");

	const handleAdd = () => {
		const parsed = Number(rate.trim());
		if (!categoryId || !rate.trim() || !Number.isFinite(parsed) || parsed < 0) {
			return;
		}
		onAdd({
			categoryId: Number(categoryId),
			basis,
			expectedRate: rate.trim(),
			period: period === "none" ? null : period,
			effectiveFrom: todayISODate(),
		});
		setCategoryId("");
		setRate("");
	};

	return (
		<div className="grid gap-2 sm:grid-cols-2">
			<EventCategorySelectField
				type="production"
				categories={categories}
				value={categoryId}
				onChange={setCategoryId}
				label="Producto"
				newOptionLabel="Nuevo producto"
				onCreateEventCategory={onCreateCategory}
			/>
			<div className="space-y-1">
				<Label>Base</Label>
				<Select
					value={basis}
					onValueChange={(value) => setBasis(value as ProductionTargetBasis)}
				>
					<SelectTrigger>
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="per_head_continuous">Por cabeza</SelectItem>
						<SelectItem value="per_event">Por evento</SelectItem>
						<SelectItem value="total">Total</SelectItem>
					</SelectContent>
				</Select>
			</div>
			<div className="space-y-1">
				<Label>Periodo</Label>
				<Select
					value={period}
					onValueChange={(value) =>
						setPeriod(value as ProductionTargetPeriod | "none")
					}
				>
					<SelectTrigger>
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="day">Por día</SelectItem>
						<SelectItem value="year">Por año</SelectItem>
						<SelectItem value="none">Sin periodo</SelectItem>
					</SelectContent>
				</Select>
			</div>
			<div className="space-y-1">
				<Label htmlFor="production-target-rate">Tasa esperada</Label>
				<Input
					id="production-target-rate"
					type="number"
					min="0"
					step="0.01"
					value={rate}
					placeholder="0.7"
					onChange={(event) => setRate(event.target.value)}
				/>
			</div>
			<div className="sm:col-span-2">
				<Button
					type="button"
					onClick={handleAdd}
					disabled={disabled}
					className="w-full"
				>
					Agregar meta
				</Button>
			</div>
		</div>
	);
}
