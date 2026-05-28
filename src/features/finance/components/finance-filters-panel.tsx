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
	createDefaultFinanceFilters,
	type FinanceAssetKindFilter,
	type FinanceFilters,
	type FinanceMaterialReasonFilter,
} from "@/features/finance/finance-types";
import { formatAssetKind } from "@/features/finance/finance-utils";
import type { ILivestockAsset } from "@/features/livestock/types/livestock-types";
import type { ProductionBucket, Unit } from "@/features/reports/types/reports-types";
import { EVENT_UNITS_BY_DIMENSION } from "@/shared/types/unit-types";

interface FinanceFiltersPanelProps {
	assets: ILivestockAsset[];
	initialFilters?: FinanceFilters;
	isLoadingAssets?: boolean;
	onApply: (filters: FinanceFilters) => void;
}

const BUCKET_OPTIONS: ProductionBucket[] = ["day", "week", "month"];
const ASSET_KIND_OPTIONS: FinanceAssetKindFilter[] = [
	"all",
	"animal",
	"material",
	"crop",
	"equipment",
	"location",
];
const MATERIAL_REASON_OPTIONS: FinanceMaterialReasonFilter[] = [
	"all",
	"feeding",
	"waste",
	"spoilage",
];

const formatBucket = (value: ProductionBucket): string => {
	if (value === "day") return "Diario";
	if (value === "week") return "Semanal";
	return "Mensual";
};

const formatReason = (value: FinanceMaterialReasonFilter): string => {
	if (value === "all") return "Todas las razones";
	if (value === "feeding") return "Alimentacion";
	if (value === "waste") return "Desperdicio";
	return "Deterioro";
};

export const FinanceFiltersPanel = ({
	assets,
	initialFilters = createDefaultFinanceFilters(),
	isLoadingAssets = false,
	onApply,
}: FinanceFiltersPanelProps) => {
	const [draft, setDraft] = useState<FinanceFilters>(initialFilters);
	const assetOptions = assets.filter(
		(asset) => draft.assetKind === "all" || asset.kind === draft.assetKind,
	);
	const isDateRangeValid = !draft.dateFrom || !draft.dateTo || draft.dateFrom <= draft.dateTo;

	const handleAssetKindChange = (value: string) => {
		const nextKind = value as FinanceAssetKindFilter;
		const nextAssetOptions = assets.filter(
			(asset) => nextKind === "all" || asset.kind === nextKind,
		);

		setDraft((current) => ({
			...current,
			assetKind: nextKind,
			assetId: nextAssetOptions.some((asset) => asset.id === current.assetId)
				? current.assetId
				: undefined,
		}));
	};

	return (
		<section className="v2-card space-y-4 p-5 md:p-6">
			<div className="flex items-start justify-between gap-4">
				<div>
					<p className="v2-kicker">Filtros</p>
					<h3 className="mt-2 text-base font-semibold">Vista financiera</h3>
				</div>
				<Button
					type="button"
					onClick={() => onApply(draft)}
					disabled={!isDateRangeValid}
				>
					Aplicar filtros
				</Button>
			</div>

			<div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
				<div className="space-y-2">
					<Label>Desde</Label>
					<Input
						type="date"
						value={draft.dateFrom}
						onChange={(event) =>
							setDraft((current) => ({
								...current,
								dateFrom: event.target.value,
							}))
						}
					/>
				</div>

				<div className="space-y-2">
					<Label>Hasta</Label>
					<Input
						type="date"
						value={draft.dateTo}
						onChange={(event) =>
							setDraft((current) => ({
								...current,
								dateTo: event.target.value,
							}))
						}
					/>
				</div>

				<div className="space-y-2">
					<Label>Periodo</Label>
					<Select
						value={draft.bucket}
						onValueChange={(value) =>
							setDraft((current) => ({
								...current,
								bucket: value as ProductionBucket,
							}))
						}
					>
						<SelectTrigger>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{BUCKET_OPTIONS.map((option) => (
								<SelectItem
									key={option}
									value={option}
								>
									{formatBucket(option)}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div className="space-y-2">
					<Label>Tipo de activo</Label>
					<Select
						value={draft.assetKind}
						onValueChange={handleAssetKindChange}
					>
						<SelectTrigger>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{ASSET_KIND_OPTIONS.map((option) => (
								<SelectItem
									key={option}
									value={option}
								>
									{formatAssetKind(option)}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div className="space-y-2">
					<Label>Activo o rebano</Label>
					<Select
						value={draft.assetId ? String(draft.assetId) : ""}
						onValueChange={(value) =>
							setDraft((current) => ({
								...current,
								assetId: value ? Number(value) : undefined,
							}))
						}
						disabled={isLoadingAssets}
					>
						<SelectTrigger>
							<SelectValue placeholder={isLoadingAssets ? "Cargando..." : "Toda la granja"} />
						</SelectTrigger>
						<SelectContent>
							{assetOptions.map((asset) => (
								<SelectItem
									key={asset.id}
									value={String(asset.id)}
								>
									{asset.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div className="space-y-2">
					<Label>Unidad productiva</Label>
					<Select
						value={draft.productionUnit}
						onValueChange={(value) =>
							setDraft((current) => ({
								...current,
								productionUnit: value as Unit,
							}))
						}
					>
						<SelectTrigger>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{EVENT_UNITS_BY_DIMENSION.mass.map((unit) => (
								<SelectItem
									key={unit}
									value={unit}
								>
									Masa: {unit}
								</SelectItem>
							))}
							{EVENT_UNITS_BY_DIMENSION.volume.map((unit) => (
								<SelectItem
									key={unit}
									value={unit}
								>
									Volumen: {unit}
								</SelectItem>
							))}
							{EVENT_UNITS_BY_DIMENSION.count.map((unit) => (
								<SelectItem
									key={unit}
									value={unit}
								>
									Conteo: {unit}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div className="space-y-2">
					<Label>Consumo material</Label>
					<Select
						value={draft.materialReason}
						onValueChange={(value) =>
							setDraft((current) => ({
								...current,
								materialReason: value as FinanceMaterialReasonFilter,
							}))
						}
					>
						<SelectTrigger>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{MATERIAL_REASON_OPTIONS.map((option) => (
								<SelectItem
									key={option}
									value={option}
								>
									{formatReason(option)}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			</div>

			{!isDateRangeValid && (
				<p className="text-sm text-destructive">
					La fecha inicial no puede ser mayor que la fecha final.
				</p>
			)}
		</section>
	);
};