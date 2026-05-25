import { useCallback, useEffect, useMemo, useState } from "react";

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
import { getMaterialActionErrorMessage } from "@/features/inventory/components/material-action-utils";
import {
	useCreateMaterialConsumptionByFarmId,
	useListLivestockAssetsByFarmId,
	useListMaterialConsumptionsByFarmId,
} from "@/features/livestock/api/livestock-queries";
import type { LivestockEventUnit } from "@/features/livestock/types/livestock-types";
import { useGetInventorySummaryReport } from "@/features/reports/api/reports-queries";
import { EVENT_UNITS } from "@/shared/types/unit-types";

interface ManualFeedingPanelProps {
	farmId: string;
	consumerAssetId: number;
	consumerAssetName: string;
}

interface FeedingProfile {
	materialAssetId: number;
	quantity: number;
	unit: LivestockEventUnit;
	maxFeedsPerDay: number;
	minHoursBetweenFeeds: number;
}

type FeedingProfileMap = Record<string, FeedingProfile>;

const FEEDING_PROFILE_STORAGE_KEY = "v2-feeding-profiles";

function getProfileMapFromStorage(): FeedingProfileMap {
	if (typeof window === "undefined") return {};

	const raw = window.localStorage.getItem(FEEDING_PROFILE_STORAGE_KEY);
	if (!raw) return {};

	try {
		const parsed = JSON.parse(raw) as unknown;
		if (!parsed || typeof parsed !== "object") return {};
		return parsed as FeedingProfileMap;
	} catch {
		return {};
	}
}

function setProfileMapToStorage(nextMap: FeedingProfileMap) {
	if (typeof window === "undefined") return;
	window.localStorage.setItem(
		FEEDING_PROFILE_STORAGE_KEY,
		JSON.stringify(nextMap),
	);
}

export function ManualFeedingPanel({
	farmId,
	consumerAssetId,
	consumerAssetName,
}: ManualFeedingPanelProps) {
	const profileStorageId = `${farmId}:${consumerAssetId}`;
	const [materialAssetId, setMaterialAssetId] = useState<string>("");
	const [quantity, setQuantity] = useState<string>("");
	const [unit, setUnit] = useState<LivestockEventUnit>("kg");
	const [maxFeedsPerDay, setMaxFeedsPerDay] = useState<string>("1");
	const [minHoursBetweenFeeds, setMinHoursBetweenFeeds] = useState<string>("0");
	const [saveError, setSaveError] = useState<string | null>(null);
	const [feedError, setFeedError] = useState<string | null>(null);
	const [lastFeedAtIso, setLastFeedAtIso] = useState<string | null>(null);
	const [needsExtraFeedConfirmation, setNeedsExtraFeedConfirmation] =
		useState(false);
	const [feedConfirmationMessage, setFeedConfirmationMessage] = useState<
		string | null
	>(null);
	const [optimisticMaterialFeedAdds, setOptimisticMaterialFeedAdds] = useState<
		Record<number, number>
	>({});
	const [optimisticLastFeedAtByMaterial, setOptimisticLastFeedAtByMaterial] =
		useState<Record<number, string>>({});

	const { data: materialAssetsResponse, isLoading: isLoadingMaterials } =
		useListLivestockAssetsByFarmId({
			farmId,
			filters: { kind: "material", page: 1, pageSize: 100 },
			enabled: !!farmId,
		});

	const selectedMaterialAssetId = Number(materialAssetId);
	const hasSelectedMaterial = Number.isInteger(selectedMaterialAssetId);

	const { data: selectedMaterialInventory } = useGetInventorySummaryReport(
		{
			farmId,
			asset_id: hasSelectedMaterial ? selectedMaterialAssetId : undefined,
		},
		!!farmId && hasSelectedMaterial,
	);

	const { startOfTodayIso, endOfTodayIso } = useMemo(() => {
		const now = new Date();
		const start = new Date(now);
		start.setHours(0, 0, 0, 0);

		const end = new Date(now);
		end.setHours(23, 59, 59, 999);

		return {
			startOfTodayIso: start.toISOString(),
			endOfTodayIso: end.toISOString(),
		};
	}, []);

	const { data: todaysFeedingResponse } = useListMaterialConsumptionsByFarmId({
		farmId,
		filters: {
			consumerAssetId,
			reason: "feeding",
			from: startOfTodayIso,
			to: endOfTodayIso,
			page: 1,
			pageSize: 100,
		},
		enabled: !!farmId,
	});

	const createMaterialConsumptionMutation =
		useCreateMaterialConsumptionByFarmId();

	const materialOptions = useMemo(
		() => materialAssetsResponse?.data ?? [],
		[materialAssetsResponse?.data],
	);

	const selectedMaterial = useMemo(
		() => materialOptions.find((asset) => asset.id === selectedMaterialAssetId),
		[materialOptions, selectedMaterialAssetId],
	);

	const selectedMaterialOnHand = useMemo(() => {
		if (!selectedMaterialInventory?.data?.length) return null;
		const total = selectedMaterialInventory.data.reduce((sum, row) => {
			const onHand = Number(row.on_hand);
			return Number.isFinite(onHand) ? sum + onHand : sum;
		}, 0);
		return total;
	}, [selectedMaterialInventory?.data]);

	const todaysFeeds = useMemo(() => {
		const rows = todaysFeedingResponse?.data ?? [];
		if (!hasSelectedMaterial) {
			return {
				count: rows.length,
				countForSelectedMaterial: 0,
				totalForSelectedMaterialAndUnit: 0,
				latestFeedAtForSelectedMaterial: null as string | null,
			};
		}

		const materialRows = rows.filter(
			(row) => row.material_asset_id === selectedMaterialAssetId,
		);

		const totalForSelectedMaterialAndUnit = materialRows.reduce((sum, row) => {
			if (row.unit !== unit) {
				return sum;
			}

			const consumed = Number(row.quantity);
			return Number.isFinite(consumed) ? sum + consumed : sum;
		}, 0);

		const latestFeedAtForSelectedMaterial = materialRows
			.map((row) => row.occurred_at)
			.reduce<string | null>((latest, current) => {
				if (!latest) return current;
				return new Date(current).getTime() > new Date(latest).getTime()
					? current
					: latest;
			}, null);

		return {
			count: rows.length,
			countForSelectedMaterial: materialRows.length,
			totalForSelectedMaterialAndUnit,
			latestFeedAtForSelectedMaterial,
		};
	}, [
		todaysFeedingResponse?.data,
		hasSelectedMaterial,
		selectedMaterialAssetId,
		unit,
	]);

	const effectiveCountForSelectedMaterial = useMemo(() => {
		if (!hasSelectedMaterial) return 0;

		return (
			todaysFeeds.countForSelectedMaterial +
			(optimisticMaterialFeedAdds[selectedMaterialAssetId] ?? 0)
		);
	}, [
		hasSelectedMaterial,
		todaysFeeds.countForSelectedMaterial,
		optimisticMaterialFeedAdds,
		selectedMaterialAssetId,
	]);

	const effectiveLatestFeedAtForSelectedMaterial = useMemo(() => {
		if (!hasSelectedMaterial) return null;

		const serverLatest = todaysFeeds.latestFeedAtForSelectedMaterial;
		const optimisticLatest =
			optimisticLastFeedAtByMaterial[selectedMaterialAssetId] ?? null;

		if (!serverLatest) return optimisticLatest;
		if (!optimisticLatest) return serverLatest;

		return new Date(optimisticLatest).getTime() >
			new Date(serverLatest).getTime()
			? optimisticLatest
			: serverLatest;
	}, [
		hasSelectedMaterial,
		todaysFeeds.latestFeedAtForSelectedMaterial,
		optimisticLastFeedAtByMaterial,
		selectedMaterialAssetId,
	]);

	useEffect(() => {
		setOptimisticMaterialFeedAdds({});
		setOptimisticLastFeedAtByMaterial({});
	}, [todaysFeedingResponse?.data]);

	useEffect(() => {
		const profileMap = getProfileMapFromStorage();
		const profile = profileMap[profileStorageId];

		if (!profile) {
			setMaterialAssetId("");
			setQuantity("");
			setUnit("kg");
			setMaxFeedsPerDay("1");
			setMinHoursBetweenFeeds("0");
			return;
		}

		setMaterialAssetId(String(profile.materialAssetId));
		setQuantity(String(profile.quantity));
		setUnit(profile.unit);
		setMaxFeedsPerDay(
			String(
				Number.isFinite(profile.maxFeedsPerDay) && profile.maxFeedsPerDay >= 1
					? profile.maxFeedsPerDay
					: 1,
			),
		);
		setMinHoursBetweenFeeds(
			String(
				Number.isFinite(profile.minHoursBetweenFeeds) &&
					profile.minHoursBetweenFeeds >= 0
					? profile.minHoursBetweenFeeds
					: 0,
			),
		);
	}, [profileStorageId]);

	const handleSaveProfile = useCallback(() => {
		if (!farmId) return;

		const parsedMaterialAssetId = Number(materialAssetId);
		const parsedQuantity = Number(quantity);
		const parsedMaxFeedsPerDay = Number(maxFeedsPerDay);
		const parsedMinHoursBetweenFeeds = Number(minHoursBetweenFeeds);

		if (!Number.isInteger(parsedMaterialAssetId)) {
			setSaveError("Selecciona un material para este activo animal.");
			return;
		}

		if (!Number.isFinite(parsedQuantity) || parsedQuantity <= 0) {
			setSaveError("La cantidad por dia debe ser mayor a 0.");
			return;
		}

		if (!Number.isFinite(parsedMaxFeedsPerDay) || parsedMaxFeedsPerDay < 1) {
			setSaveError("El maximo de alimentaciones por dia debe ser al menos 1.");
			return;
		}

		if (
			!Number.isFinite(parsedMinHoursBetweenFeeds) ||
			parsedMinHoursBetweenFeeds < 0
		) {
			setSaveError(
				"El intervalo minimo entre alimentaciones no puede ser negativo.",
			);
			return;
		}

		const currentMap = getProfileMapFromStorage();
		const nextMap: FeedingProfileMap = {
			...currentMap,
			[profileStorageId]: {
				materialAssetId: parsedMaterialAssetId,
				quantity: parsedQuantity,
				unit,
				maxFeedsPerDay: Math.max(1, Math.floor(parsedMaxFeedsPerDay)),
				minHoursBetweenFeeds: parsedMinHoursBetweenFeeds,
			},
		};

		setProfileMapToStorage(nextMap);
		setSaveError(null);
	}, [
		farmId,
		materialAssetId,
		profileStorageId,
		quantity,
		unit,
		maxFeedsPerDay,
		minHoursBetweenFeeds,
	]);

	const handleClearProfile = useCallback(() => {
		const currentMap = getProfileMapFromStorage();
		if (!(profileStorageId in currentMap)) {
			setMaterialAssetId("");
			setQuantity("");
			setUnit("kg");
			setMaxFeedsPerDay("1");
			setMinHoursBetweenFeeds("0");
			setSaveError(null);
			return;
		}

		const rest = { ...currentMap };
		delete rest[profileStorageId];
		setProfileMapToStorage(rest);
		setMaterialAssetId("");
		setQuantity("");
		setUnit("kg");
		setMaxFeedsPerDay("1");
		setMinHoursBetweenFeeds("0");
		setSaveError(null);
	}, [profileStorageId]);

	const handleLogFeedingNow = useCallback(async () => {
		if (!farmId) return;

		setFeedError(null);
		const parsedMaterialAssetId = Number(materialAssetId);
		const parsedQuantity = Number(quantity);
		const parsedMaxFeedsPerDay = Number(maxFeedsPerDay);
		const parsedMinHoursBetweenFeeds = Number(minHoursBetweenFeeds);

		if (!Number.isInteger(parsedMaterialAssetId)) {
			setFeedError(
				"Selecciona un material antes de registrar la alimentacion.",
			);
			return;
		}

		if (!Number.isFinite(parsedQuantity) || parsedQuantity <= 0) {
			setFeedError("La cantidad debe ser mayor a 0 para registrar consumo.");
			return;
		}

		if (!Number.isFinite(parsedMaxFeedsPerDay) || parsedMaxFeedsPerDay < 1) {
			setFeedError("Configura un maximo diario valido (minimo 1). ");
			return;
		}

		if (
			!Number.isFinite(parsedMinHoursBetweenFeeds) ||
			parsedMinHoursBetweenFeeds < 0
		) {
			setFeedError("Configura un intervalo minimo valido (>= 0). ");
			return;
		}

		const warningMessages: string[] = [];
		const maxFeedsPerDayLimit = Math.max(1, Math.floor(parsedMaxFeedsPerDay));

		if (effectiveCountForSelectedMaterial >= maxFeedsPerDayLimit) {
			warningMessages.push(
				`Este material ya alcanzo ${effectiveCountForSelectedMaterial} registro(s) hoy, y tu limite configurado es ${maxFeedsPerDayLimit}.`,
			);
		}

		if (
			parsedMinHoursBetweenFeeds > 0 &&
			effectiveLatestFeedAtForSelectedMaterial
		) {
			const now = new Date();
			const latest = new Date(effectiveLatestFeedAtForSelectedMaterial);
			const elapsedHours =
				(now.getTime() - latest.getTime()) / (1000 * 60 * 60);

			if (elapsedHours < parsedMinHoursBetweenFeeds) {
				const hoursLeft = Math.max(
					0,
					parsedMinHoursBetweenFeeds - elapsedHours,
				);
				warningMessages.push(
					`Aun no se cumple el intervalo minimo entre alimentaciones. Faltan aproximadamente ${hoursLeft.toFixed(2)} hora(s).`,
				);
			}
		}

		if (warningMessages.length > 0 && !needsExtraFeedConfirmation) {
			setFeedConfirmationMessage(warningMessages.join(" "));
			setNeedsExtraFeedConfirmation(true);
			setFeedError(warningMessages.join(" "));
			return;
		}

		try {
			await createMaterialConsumptionMutation.mutateAsync({
				farmId,
				data: {
					material_asset_id: parsedMaterialAssetId,
					consumer_asset_id: consumerAssetId,
					individual_id: null,
					occurred_at: new Date().toISOString(),
					quantity: parsedQuantity,
					unit,
					reason: "feeding",
					notes: `Registro rapido desde ${consumerAssetName}`,
					idempotency_key: crypto.randomUUID(),
				},
			});
			setOptimisticMaterialFeedAdds((current) => ({
				...current,
				[parsedMaterialAssetId]: (current[parsedMaterialAssetId] ?? 0) + 1,
			}));
			setOptimisticLastFeedAtByMaterial((current) => ({
				...current,
				[parsedMaterialAssetId]: new Date().toISOString(),
			}));
			setLastFeedAtIso(new Date().toISOString());
			setNeedsExtraFeedConfirmation(false);
			setFeedConfirmationMessage(null);
			setFeedError(null);
		} catch (error) {
			setFeedError(
				getMaterialActionErrorMessage(
					error,
					"No se pudo registrar la alimentacion del activo.",
				),
			);
		}
	}, [
		farmId,
		materialAssetId,
		quantity,
		unit,
		maxFeedsPerDay,
		minHoursBetweenFeeds,
		effectiveCountForSelectedMaterial,
		effectiveLatestFeedAtForSelectedMaterial,
		needsExtraFeedConfirmation,
		createMaterialConsumptionMutation,
		consumerAssetId,
		consumerAssetName,
	]);

	return (
		<div className="v2-card p-4">
			<div className="mb-3 flex items-start justify-between gap-3">
				<div>
					<p className="v2-kicker">Alimentacion manual</p>
					<p className="text-sm text-(--v2-ink-soft)">
						Configura material + cantidad diaria y registra el consumo en un
						clic cuando ya alimentaste en campo.
					</p>
				</div>
				{todaysFeeds.count > 0 ? (
					<span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
						{todaysFeeds.count} registro(s) hoy
					</span>
				) : null}
			</div>

			<div className="grid gap-3 md:grid-cols-3">
				<div className="space-y-1.5 md:col-span-2">
					<Label htmlFor="manual-feeding-material">Material asignado</Label>
					<Select
						value={materialAssetId || "none"}
						onValueChange={(value) => {
							setMaterialAssetId(value === "none" ? "" : value);
							setSaveError(null);
							setFeedError(null);
							setNeedsExtraFeedConfirmation(false);
							setFeedConfirmationMessage(null);
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
						<p className="text-xs text-(--v2-ink-soft)">
							Cargando materiales...
						</p>
					) : null}
				</div>
				<div className="space-y-1.5">
					<Label htmlFor="manual-feeding-unit">Unidad</Label>
					<Select
						value={unit}
						onValueChange={(value) => {
							setUnit(value as LivestockEventUnit);
							setFeedError(null);
							setNeedsExtraFeedConfirmation(false);
							setFeedConfirmationMessage(null);
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
					<Label htmlFor="manual-feeding-qty">Cantidad por registro</Label>
					<Input
						id="manual-feeding-qty"
						type="number"
						min="0"
						step="0.01"
						value={quantity}
						onChange={(event) => {
							setQuantity(event.target.value);
							setSaveError(null);
							setFeedError(null);
							setNeedsExtraFeedConfirmation(false);
							setFeedConfirmationMessage(null);
						}}
					/>
				</div>
				<div className="space-y-1.5">
					<Label htmlFor="manual-feeding-max-per-day">
						Aviso: maximo por dia
					</Label>
					<Input
						id="manual-feeding-max-per-day"
						type="number"
						min="1"
						step="1"
						value={maxFeedsPerDay}
						onChange={(event) => {
							setMaxFeedsPerDay(event.target.value);
							setSaveError(null);
							setFeedError(null);
							setNeedsExtraFeedConfirmation(false);
							setFeedConfirmationMessage(null);
						}}
					/>
				</div>
				<div className="space-y-1.5">
					<Label htmlFor="manual-feeding-min-hours">
						Aviso: horas minimas entre tomas
					</Label>
					<Input
						id="manual-feeding-min-hours"
						type="number"
						min="0"
						step="0.25"
						value={minHoursBetweenFeeds}
						onChange={(event) => {
							setMinHoursBetweenFeeds(event.target.value);
							setSaveError(null);
							setFeedError(null);
							setNeedsExtraFeedConfirmation(false);
							setFeedConfirmationMessage(null);
						}}
					/>
				</div>
			</div>

			<div className="mt-3 flex flex-wrap items-center gap-2">
				<Button
					type="button"
					onClick={handleSaveProfile}
					variant="outline"
				>
					Guardar configuracion
				</Button>
				<Button
					type="button"
					onClick={handleClearProfile}
					variant="ghost"
				>
					Limpiar
				</Button>
				<Button
					type="button"
					onClick={() => {
						void handleLogFeedingNow();
					}}
					disabled={createMaterialConsumptionMutation.isPending}
				>
					{createMaterialConsumptionMutation.isPending
						? "Registrando..."
						: needsExtraFeedConfirmation
							? "Confirmar alimentacion extra"
							: "Registrar alimentacion ahora"}
				</Button>
			</div>

			{needsExtraFeedConfirmation ? (
				<div className="mt-3 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900">
					<p className="font-semibold">Confirmacion requerida</p>
					<p className="mt-1">
						{feedConfirmationMessage ??
							"Se alcanzo un limite de aviso para este material. Si deseas continuar, confirma el registro."}
					</p>
					<div className="mt-2 flex items-center gap-2">
						<Button
							type="button"
							onClick={() => {
								void handleLogFeedingNow();
							}}
							size="sm"
							disabled={createMaterialConsumptionMutation.isPending}
						>
							Confirmar registro extra
						</Button>
						<Button
							type="button"
							variant="ghost"
							size="sm"
							onClick={() => {
								setNeedsExtraFeedConfirmation(false);
								setFeedConfirmationMessage(null);
								setFeedError(null);
							}}
						>
							Cancelar
						</Button>
					</div>
				</div>
			) : null}

			<div className="mt-3 grid gap-2 md:grid-cols-2">
				<div className="rounded-lg border border-(--v2-border) bg-white px-3 py-2 text-sm">
					<p className="text-xs uppercase tracking-[0.08em] text-(--v2-ink-soft)">
						Stock actual del material
					</p>
					<p className="mt-1 font-semibold">
						{selectedMaterial
							? `${selectedMaterial.name}: ${
									selectedMaterialOnHand != null
										? selectedMaterialOnHand.toFixed(2)
										: "Sin dato"
								} ${unit}`
							: "Selecciona un material"}
					</p>
				</div>
				<div className="rounded-lg border border-(--v2-border) bg-white px-3 py-2 text-sm">
					<p className="text-xs uppercase tracking-[0.08em] text-(--v2-ink-soft)">
						Consumo hoy (material/unidad seleccionados)
					</p>
					<p className="mt-1 font-semibold">
						{todaysFeeds.totalForSelectedMaterialAndUnit.toFixed(2)} {unit}
					</p>
					{lastFeedAtIso ? (
						<p className="mt-1 text-xs text-(--v2-ink-soft)">
							Ultimo registro rapido:{" "}
							{new Date(lastFeedAtIso).toLocaleString("es-EC")}
						</p>
					) : null}
				</div>
			</div>

			{saveError ? (
				<p className="mt-2 text-sm text-red-700">{saveError}</p>
			) : null}
			{feedError ? (
				<p className="mt-2 text-sm text-red-700">{feedError}</p>
			) : null}
		</div>
	);
}
