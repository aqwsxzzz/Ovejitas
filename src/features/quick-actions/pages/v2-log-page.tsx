import { useNavigate, useSearch } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import type { FormEvent } from "react";

import { useGetUserProfile } from "@/features/auth/api/auth-queries";
import {
	createEventByAssetId,
	createEventCategoryByFarmId,
	createIndividual,
	createLivestockAsset,
} from "@/features/livestock/api/livestock-api";
import type {
	IndividualSex,
	LivestockAssetMode,
	LivestockEventType,
} from "@/features/livestock/types/livestock-types";

function parseUnitIdFromPath(path?: string): string | null {
	if (!path) return null;
	const match = path.match(/\/v2\/production-units\/flock\/([^/]+)/);
	return match?.[1] ? decodeURIComponent(match[1]) : null;
}

function eventTypeLabelEs(type: LivestockEventType): string {
	switch (type) {
		case "production":
			return "Produccion";
		case "expense":
			return "Gasto";
		case "income":
			return "Ingreso";
		case "observation":
			return "Observacion";
		case "reproductive":
			return "Reproductivo";
		case "acquisition":
			return "Adquisicion";
		case "mortality":
			return "Mortalidad";
		default:
			return type;
	}
}

function ActionCard(props: {
	title: string;
	subtitle: string;
	children: React.ReactNode;
}) {
	return (
		<div className="v2-card p-5">
			<p className="v2-kicker">{props.title}</p>
			<p className="mt-1 text-sm text-(--v2-ink-soft)">{props.subtitle}</p>
			<div className="mt-4 space-y-3">{props.children}</div>
		</div>
	);
}

export function V2LogPage() {
	const search = useSearch({ from: "/v2/log" });
	const navigate = useNavigate();
	const { data: currentUser } = useGetUserProfile();
	const farmId = currentUser?.lastVisitedFarmId ?? "";
	const unitId = useMemo(
		() => parseUnitIdFromPath(search.sourcePath),
		[search.sourcePath],
	);

	const [isSaving, setIsSaving] = useState(false);
	const [message, setMessage] = useState("");

	const [lotName, setLotName] = useState("");
	const [lotLocation, setLotLocation] = useState("");
	const [lotInitialAmount, setLotInitialAmount] = useState("");
	const [lotDescription, setLotDescription] = useState("");
	const [lotMode, setLotMode] = useState<LivestockAssetMode>("aggregated");

	const [individualName, setIndividualName] = useState("");
	const [individualTag, setIndividualTag] = useState("");
	const [individualSex, setIndividualSex] = useState<IndividualSex>("unknown");

	const [categoryName, setCategoryName] = useState("");
	const [categoryType, setCategoryType] =
		useState<LivestockEventType>("production");
	const [categoryColor, setCategoryColor] = useState("#8a8677");

	const handleUseAcquisitionPreset = () => {
		setCategoryName("adquisicion");
		setCategoryType("acquisition");
		setCategoryColor("#6b7280");
	};

	const goBack = () =>
		navigate({
			to: search.sourcePath ?? "/v2/dashboard",
		});

	async function handleCreateLot(event: FormEvent) {
		event.preventDefault();
		if (!farmId || !lotName.trim()) return;
		const parsedInitialAmount = Number(lotInitialAmount);
		if (
			lotMode === "aggregated" &&
			(!lotInitialAmount.trim() ||
				!Number.isFinite(parsedInitialAmount) ||
				parsedInitialAmount < 0)
		) {
			setMessage("Ingresa una cantidad inicial valida para el lote agrupado.");
			return;
		}
		setIsSaving(true);
		setMessage("");
		try {
			const createdAsset = await createLivestockAsset({
				farmId,
				data: {
					name: lotName.trim(),
					location: lotLocation.trim() || undefined,
					description: lotDescription.trim() || undefined,
					kind: "animal",
					mode: lotMode,
				},
			});

			if (lotMode === "aggregated") {
				await createEventByAssetId({
					farmId,
					assetId: String(createdAsset.id),
					data: {
						type: "acquisition",
						occurred_at: new Date().toISOString(),
						quantity: parsedInitialAmount,
						notes: "Conteo inicial del lote",
						payload: { source: "initial_asset_setup" },
					},
				});
			}

			setMessage("Lote creado.");
			goBack();
		} finally {
			setIsSaving(false);
		}
	}

	async function handleCreateIndividual(event: FormEvent) {
		event.preventDefault();
		if (!farmId || !unitId || !individualTag.trim()) return;
		setIsSaving(true);
		setMessage("");
		try {
			await createIndividual({
				farmId,
				assetId: unitId,
				data: {
					name: individualName.trim() || individualTag.trim(),
					tag: individualTag.trim(),
					extra: { sex: individualSex },
				},
			});
			setMessage("Individual creado.");
			goBack();
		} finally {
			setIsSaving(false);
		}
	}

	async function handleCreateCategory(event: FormEvent) {
		event.preventDefault();
		if (!farmId || !categoryName.trim()) return;
		setIsSaving(true);
		setMessage("");
		try {
			await createEventCategoryByFarmId({
				farmId,
				data: {
					type: categoryType,
					name: categoryName.trim(),
					color: categoryColor,
				},
			});
			setMessage("Categoria creada.");
			goBack();
		} finally {
			setIsSaving(false);
		}
	}

	const actionId = search.actionId;

	return (
		<section className="space-y-4">
			<div className="v2-card p-5 md:p-6">
				<p className="v2-kicker">Accion rapida</p>
				<h2 className="mt-2 text-xl font-semibold">
					{search.actionLabel ?? "Selecciona una accion"}
				</h2>
				<p className="mt-1 text-sm text-(--v2-ink-soft)">
					{search.contextLabel
						? `Contexto actual: ${search.contextLabel}`
						: "Sin contexto especifico"}
				</p>
			</div>

			{!farmId ? (
				<ActionCard
					title="Granja"
					subtitle="Necesitas una granja activa para crear datos."
				>
					<p className="text-sm text-(--v2-ink-soft)">
						Selecciona una granja y vuelve a intentarlo.
					</p>
				</ActionCard>
			) : actionId === "nuevo-lote" ? (
				<ActionCard
					title="Crear lote"
					subtitle="Este flujo solo crea registros nuevos."
				>
					<form
						className="space-y-3"
						onSubmit={handleCreateLot}
					>
						<div className="space-y-1">
							<p className="text-xs font-medium text-(--v2-ink-soft)">
								Modo de seguimiento
							</p>
							<div className="flex gap-2">
								<button
									type="button"
									onClick={() => setLotMode("aggregated")}
									className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition ${
										lotMode === "aggregated"
											? "border-(--v2-ink) bg-(--v2-ink) text-white"
											: "border-(--v2-border) bg-white"
									}`}
								>
									Agrupado
								</button>
								<button
									type="button"
									onClick={() => setLotMode("individual")}
									className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition ${
										lotMode === "individual"
											? "border-(--v2-ink) bg-(--v2-ink) text-white"
											: "border-(--v2-border) bg-white"
									}`}
								>
									Individual
								</button>
							</div>
							<p className="text-xs text-(--v2-ink-soft)">
								{lotMode === "aggregated"
									? "Seguimiento por conteo grupal"
									: "Seguimiento por miembros individuales"}
							</p>
						</div>
						<input
							className="w-full rounded-lg border border-(--v2-border) px-3 py-2 text-sm"
							placeholder="Nombre del lote"
							value={lotName}
							onChange={(event) => setLotName(event.target.value)}
						/>
						<input
							className="w-full rounded-lg border border-(--v2-border) px-3 py-2 text-sm"
							placeholder="Ubicacion"
							value={lotLocation}
							onChange={(event) => setLotLocation(event.target.value)}
						/>
						{lotMode === "aggregated" ? (
							<input
								type="number"
								min="0"
								step="1"
								className="w-full rounded-lg border border-(--v2-border) px-3 py-2 text-sm"
								placeholder="Cantidad inicial de animales"
								value={lotInitialAmount}
								onChange={(event) => setLotInitialAmount(event.target.value)}
							/>
						) : null}
						<textarea
							className="w-full rounded-lg border border-(--v2-border) px-3 py-2 text-sm"
							placeholder="Descripcion (ej: 120 gallinas ponedoras, edad promedio 8 meses)"
							rows={3}
							value={lotDescription}
							onChange={(event) => setLotDescription(event.target.value)}
						/>
						<button
							disabled={isSaving}
							className="rounded-full bg-(--v2-ink) px-4 py-2 text-sm font-semibold text-white"
						>
							{isSaving ? "Guardando..." : "Crear lote"}
						</button>
					</form>
				</ActionCard>
			) : actionId === "nuevo-animal" ? (
				<ActionCard
					title="Crear individual"
					subtitle="Solo creacion. Editar y eliminar se hace en la vista del lote."
				>
					{!unitId ? (
						<p className="text-sm text-(--v2-ink-soft)">
							Abre Quicklog desde un lote para crear un individual.
						</p>
					) : (
						<form
							className="space-y-3"
							onSubmit={handleCreateIndividual}
						>
							<input
								className="w-full rounded-lg border border-(--v2-border) px-3 py-2 text-sm"
								placeholder="Nombre"
								value={individualName}
								onChange={(event) => setIndividualName(event.target.value)}
							/>
							<input
								className="w-full rounded-lg border border-(--v2-border) px-3 py-2 text-sm"
								placeholder="Tag"
								value={individualTag}
								onChange={(event) => setIndividualTag(event.target.value)}
							/>
							<select
								className="w-full rounded-lg border border-(--v2-border) px-3 py-2 text-sm"
								value={individualSex}
								onChange={(event) =>
									setIndividualSex(event.target.value as IndividualSex)
								}
							>
								<option value="unknown">Desconocido</option>
								<option value="female">Hembra</option>
								<option value="male">Macho</option>
							</select>
							<button
								disabled={isSaving}
								className="rounded-full bg-(--v2-ink) px-4 py-2 text-sm font-semibold text-white"
							>
								{isSaving ? "Guardando..." : "Crear individual"}
							</button>
						</form>
					)}
				</ActionCard>
			) : actionId === "nueva-categoria-evento" ? (
				<ActionCard
					title="Nueva categoria"
					subtitle="Solo creacion. Editar y eliminar se hace en la vista del lote."
				>
					<div className="rounded-lg border border-(--v2-border) bg-white p-3">
						<p className="text-xs font-medium uppercase tracking-[0.08em] text-(--v2-ink-soft)">
							Preset recomendado
						</p>
						<div className="mt-2 flex flex-wrap items-center gap-2">
							<button
								type="button"
								onClick={handleUseAcquisitionPreset}
								className="rounded-full border border-(--v2-border) px-3 py-1 text-xs font-semibold"
							>
								Usar adquisicion
							</button>
							<p className="text-xs text-(--v2-ink-soft)">
								Para registrar altas de cantidad en activos agrupados.
							</p>
						</div>
					</div>
					<form
						className="space-y-3"
						onSubmit={handleCreateCategory}
					>
						<input
							className="w-full rounded-lg border border-(--v2-border) px-3 py-2 text-sm"
							placeholder="Nombre"
							value={categoryName}
							onChange={(event) => setCategoryName(event.target.value)}
						/>
						<select
							className="w-full rounded-lg border border-(--v2-border) px-3 py-2 text-sm"
							value={categoryType}
							onChange={(event) =>
								setCategoryType(event.target.value as LivestockEventType)
							}
						>
							<option value="production">
								{eventTypeLabelEs("production")}
							</option>
							<option value="expense">{eventTypeLabelEs("expense")}</option>
							<option value="income">{eventTypeLabelEs("income")}</option>
							<option value="observation">
								{eventTypeLabelEs("observation")}
							</option>
							<option value="reproductive">
								{eventTypeLabelEs("reproductive")}
							</option>
							<option value="acquisition">
								{eventTypeLabelEs("acquisition")}
							</option>
							<option value="mortality">{eventTypeLabelEs("mortality")}</option>
						</select>
						<input
							type="color"
							className="h-10 w-24 rounded-lg border border-(--v2-border)"
							value={categoryColor}
							onChange={(event) => setCategoryColor(event.target.value)}
						/>
						<button
							disabled={isSaving}
							className="rounded-full bg-(--v2-ink) px-4 py-2 text-sm font-semibold text-white"
						>
							{isSaving ? "Guardando..." : "Crear categoria"}
						</button>
					</form>
				</ActionCard>
			) : (
				<ActionCard
					title="Pendiente"
					subtitle="Esta accion todavia no tiene formulario."
				>
					<p className="text-sm text-(--v2-ink-soft)">
						Accion: {actionId ?? "sin accion"}
					</p>
				</ActionCard>
			)}

			{message ? <p className="text-sm text-emerald-700">{message}</p> : null}
		</section>
	);
}
