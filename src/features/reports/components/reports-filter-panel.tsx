import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	useListLivestockAssetsByFarmId,
	useListIndividualsByAssetId,
} from "@/features/livestock/api/livestock-queries";
import { listEventsByAssetId } from "@/features/livestock/api/livestock-api";
import type {
	EventType,
	ProductionBucket,
	Unit,
} from "@/features/reports/types/reports-types";
import type { LivestockEventType } from "@/features/livestock/types/livestock-types";
import { EVENT_UNITS_BY_DIMENSION } from "@/shared/types/unit-types";

export type ReportScope = "all-assets" | "specific-asset" | "individual";

export interface ReportFilters {
	scope: ReportScope;
	eventType: EventType;
	bucket: ProductionBucket;
	unit?: Unit;
	dateFrom?: string;
	dateTo?: string;
	assetId?: number;
	individualId?: number;
}

interface ReportsFilterPanelProps {
	farmId: string;
	onApply: (filters: ReportFilters) => void;
}

const EVENT_TYPE_OPTIONS: EventType[] = [
	"production",
	"expense",
	"income",
	"observation",
	"reproductive",
	"acquisition",
	"mortality",
	"inventory",
];

const BUCKET_OPTIONS: ProductionBucket[] = ["day", "week", "month"];

const formatEventType = (type: EventType): string => {
	const map: Record<EventType, string> = {
		production: "Producción",
		expense: "Gasto",
		income: "Ingreso",
		observation: "Observación",
		reproductive: "Reproducción",
		acquisition: "Adquisición",
		mortality: "Mortalidad",
		inventory: "Inventario",
	};
	return map[type];
};

const formatBucketLabel = (bucket: ProductionBucket): string => {
	const map: Record<ProductionBucket, string> = {
		day: "Diario",
		week: "Semanal",
		month: "Mensual",
	};
	return map[bucket];
};

const toApiDateTime = (
	rawDate: string,
	endOfDay: boolean,
): string | undefined => {
	if (!rawDate) return undefined;
	const timePart = endOfDay ? "23:59:59.999" : "00:00:00.000";
	const parsed = new Date(`${rawDate}T${timePart}`);
	return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
};

const getTodayDateInput = (): string => {
	const now = new Date();
	const year = now.getFullYear();
	const month = String(now.getMonth() + 1).padStart(2, "0");
	const day = String(now.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
};

export const ReportsFilterPanel = ({
	farmId,
	onApply,
}: ReportsFilterPanelProps) => {
	const [scope, setScope] = useState<ReportScope>("all-assets");
	const [eventType, setEventType] = useState<EventType>("production");
	const [bucket, setBucket] = useState<ProductionBucket>("month");
	const [unit, setUnit] = useState<Unit>("dozen");
	const [dateFrom, setDateFrom] = useState("");
	const [dateTo, setDateTo] = useState<string>(() => getTodayDateInput());
	const [selectedAssetId, setSelectedAssetId] = useState<string>("");
	const [selectedIndividualId, setSelectedIndividualId] = useState<string>("");
	const [hasAppliedOnce, setHasAppliedOnce] = useState(false);

	const requiresAsset = scope === "specific-asset" || scope === "individual";
	const requiresIndividual = scope === "individual";
	const shouldShowBucketFilter = scope !== "individual";
	const shouldShowUnitFilter =
		scope !== "individual" && eventType === "production";
	const isDateRangeValid = !dateFrom || !dateTo || dateFrom <= dateTo;
	const dateFromApi = toApiDateTime(dateFrom, false);
	const dateToApi = toApiDateTime(dateTo, true);

	const { data: assetsResponse, isPending: isPendingAssets } =
		useListLivestockAssetsByFarmId({
			farmId,
			filters: { pageSize: 100 },
			enabled:
				!!farmId && (scope === "specific-asset" || scope === "individual"),
		});

	const allAssets = assetsResponse?.data ?? [];
	const individualModeAssets = allAssets.filter((a) => a.mode === "individual");

	const shouldCheckEventsCoverage =
		requiresAsset && !!farmId && !isPendingAssets && allAssets.length > 0;

	const { data: eventCoverageAssetIds, isPending: isPendingEventCoverage } =
		useQuery({
			queryKey: [
				"reports",
				"asset-event-coverage",
				farmId,
				eventType,
				allAssets.map((asset) => asset.id).join("-"),
			],
			queryFn: async () => {
				const checks = await Promise.all(
					allAssets.map(async (asset) => {
						try {
							const response = await listEventsByAssetId({
								farmId,
								assetId: String(asset.id),
								filters: {
									type: eventType as LivestockEventType,
									page: 1,
									pageSize: 1,
								},
							});

							return response.meta.total > 0 ? asset.id : null;
						} catch {
							return null;
						}
					}),
				);

				return checks.filter((id): id is number => id !== null);
			},
			enabled: shouldCheckEventsCoverage,
			staleTime: 60_000,
		});

	const effectiveCoverageIds = new Set(
		(eventCoverageAssetIds ?? []).map((id) => Number(id)),
	);

	const assetsForScope =
		scope === "specific-asset"
			? allAssets.filter((asset) => effectiveCoverageIds.has(Number(asset.id)))
			: individualModeAssets.filter((asset) =>
					effectiveCoverageIds.has(Number(asset.id)),
				);

	const { data: individualsResponse, isPending: isPendingIndividuals } =
		useListIndividualsByAssetId({
			farmId,
			assetId: selectedAssetId,
			filters: { status: "active", pageSize: 200 },
			enabled: scope === "individual" && !!selectedAssetId,
		});

	const individuals = individualsResponse?.data ?? [];

	const handleScopeChange = (newScope: ReportScope) => {
		setScope(newScope);
		setSelectedAssetId("");
		setSelectedIndividualId("");
	};

	const handleEventTypeChange = (newType: EventType) => {
		setEventType(newType);
		setSelectedAssetId("");
		setSelectedIndividualId("");
	};

	const handleDateFromChange = (newDate: string) => {
		setDateFrom(newDate);
	};

	const handleDateToChange = (newDate: string) => {
		setDateTo(newDate);
	};

	const handleAssetChange = (assetId: string) => {
		setSelectedAssetId(assetId);
		setSelectedIndividualId("");
	};

	const hasRequiredAsset = !requiresAsset || !!selectedAssetId;
	const hasRequiredIndividual = !requiresIndividual || !!selectedIndividualId;
	const hasAssetsMatchingFilters = !requiresAsset || assetsForScope.length > 0;
	const noCoverageByType =
		requiresAsset && !isPendingEventCoverage && effectiveCoverageIds.size === 0;
	const canApply =
		!!farmId &&
		isDateRangeValid &&
		hasAssetsMatchingFilters &&
		!noCoverageByType &&
		hasRequiredAsset &&
		hasRequiredIndividual;

	const validationMessage = !farmId
		? "Cargando granja activa..."
		: !isDateRangeValid
			? "La fecha 'Desde' no puede ser mayor que 'Hasta'."
			: noCoverageByType
				? "No hay activos con reportes para ese tipo de evento."
				: !hasAssetsMatchingFilters
					? "No hay activos disponibles para seleccionar."
					: !hasRequiredAsset
						? "Selecciona un activo para continuar."
						: !hasRequiredIndividual
							? "Selecciona un individuo para continuar."
							: "";

	const handleApply = () => {
		setHasAppliedOnce(true);
		if (!canApply) return;

		onApply({
			scope,
			eventType,
			bucket,
			unit: shouldShowUnitFilter ? unit : undefined,
			dateFrom: dateFromApi,
			dateTo: dateToApi,
			assetId: selectedAssetId ? Number(selectedAssetId) : undefined,
			individualId:
				scope === "individual" && selectedIndividualId
					? Number(selectedIndividualId)
					: undefined,
		});
	};

	return (
		<section className="v2-card p-5 md:p-6 space-y-4">
			<h3 className="text-base font-semibold">Filtros</h3>
			<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
				<div className="space-y-2">
					<Label>Alcance</Label>
					<Select
						value={scope}
						onValueChange={(v) => handleScopeChange(v as ReportScope)}
					>
						<SelectTrigger>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all-assets">Todos los activos</SelectItem>
							<SelectItem value="specific-asset">
								Un activo específico
							</SelectItem>
							<SelectItem value="individual">Un individuo</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<div className="space-y-2">
					<Label>Tipo de evento</Label>
					<Select
						value={eventType}
						onValueChange={(v) => handleEventTypeChange(v as EventType)}
					>
						<SelectTrigger>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{EVENT_TYPE_OPTIONS.map((option) => (
								<SelectItem
									key={option}
									value={option}
								>
									{formatEventType(option)}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				{shouldShowBucketFilter && (
					<div className="space-y-2">
						<Label>Período</Label>
						<Select
							value={bucket}
							onValueChange={(v) => setBucket(v as ProductionBucket)}
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
										{formatBucketLabel(option)}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				)}

				{shouldShowUnitFilter && (
					<div className="space-y-2">
						<Label>Unidad</Label>
						<Select
							value={unit}
							onValueChange={(value) => setUnit(value as Unit)}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{EVENT_UNITS_BY_DIMENSION.mass.map((unitValue) => (
									<SelectItem
										key={unitValue}
										value={unitValue}
									>
										Masa: {unitValue}
									</SelectItem>
								))}
								{EVENT_UNITS_BY_DIMENSION.volume.map((unitValue) => (
									<SelectItem
										key={unitValue}
										value={unitValue}
									>
										Volumen: {unitValue}
									</SelectItem>
								))}
								{EVENT_UNITS_BY_DIMENSION.count.map((unitValue) => (
									<SelectItem
										key={unitValue}
										value={unitValue}
									>
										Conteo: {unitValue}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				)}

				{(scope === "specific-asset" || scope === "individual") && (
					<div className="space-y-2">
						<Label>
							{scope === "specific-asset" ? "Activo" : "Activo (individual)"}
						</Label>
						<Select
							value={selectedAssetId}
							onValueChange={handleAssetChange}
							disabled={
								isPendingAssets ||
								(shouldCheckEventsCoverage && isPendingEventCoverage)
							}
						>
							<SelectTrigger>
								<SelectValue
									placeholder={
										isPendingAssets ||
										(shouldCheckEventsCoverage && isPendingEventCoverage)
											? "Cargando..."
											: "Seleccionar activo"
									}
								/>
							</SelectTrigger>
							<SelectContent>
								{assetsForScope.map((asset) => (
									<SelectItem
										key={asset.id}
										value={String(asset.id)}
									>
										{asset.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						{!isPendingEventCoverage && noCoverageByType && (
							<p className="text-xs text-muted-foreground">
								No hay activos con datos para ese tipo de evento.
							</p>
						)}
					</div>
				)}

				<div className="space-y-2">
					<Label>Desde</Label>
					<Input
						type="date"
						value={dateFrom}
						onChange={(e) => handleDateFromChange(e.target.value)}
					/>
				</div>

				<div className="space-y-2">
					<Label>Hasta</Label>
					<Input
						type="date"
						value={dateTo}
						onChange={(e) => handleDateToChange(e.target.value)}
					/>
				</div>

				{scope === "individual" && selectedAssetId && (
					<div className="space-y-2">
						<Label>Individuo</Label>
						<Select
							value={selectedIndividualId}
							onValueChange={setSelectedIndividualId}
							disabled={isPendingIndividuals}
						>
							<SelectTrigger>
								<SelectValue
									placeholder={
										isPendingIndividuals
											? "Cargando..."
											: "Seleccionar individuo"
									}
								/>
							</SelectTrigger>
							<SelectContent>
								{individuals.map((ind) => (
									<SelectItem
										key={ind.id}
										value={String(ind.id)}
									>
										{ind.name}
										{ind.tag ? ` (${ind.tag})` : ""}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				)}
			</div>

			<div className="flex justify-end pt-2">
				<Button
					type="button"
					onClick={handleApply}
					disabled={!canApply}
				>
					Consultar
				</Button>
			</div>
			{validationMessage && (
				<p className="text-xs text-muted-foreground text-right">
					{validationMessage}
				</p>
			)}
			{hasAppliedOnce && canApply && (
				<p className="text-xs text-muted-foreground text-right">
					Filtros aplicados.
				</p>
			)}
		</section>
	);
};
