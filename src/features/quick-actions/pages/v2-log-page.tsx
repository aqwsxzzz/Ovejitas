import { useNavigate, useSearch } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import type { FormEvent } from "react";

import { useGetUserProfile } from "@/features/auth/api/auth-queries";
import {
	createEventByAssetId,
	createEventCategoryByFarmId,
	createIndividual,
	createLivestockAsset,
} from "@/features/livestock/api/livestock-api";
import {
	livestockQueryKeys,
	useListEventCategoriesByFarmId,
} from "@/features/livestock/api/livestock-queries";
import type {
	IndividualSex,
	LivestockAssetMode,
} from "@/features/livestock/types/livestock-types";

const NEW_CATEGORY_OPTION_VALUE = "__new__";

function parseUnitIdFromPath(path?: string): string | null {
	if (!path) return null;
	const match = path.match(/\/v2\/production-units\/flock\/([^/]+)/);
	return match?.[1] ? decodeURIComponent(match[1]) : null;
}

function resolveReturnPath(sourcePath?: string): string {
	if (!sourcePath || sourcePath.startsWith("/v2/log")) {
		return "/v2/dashboard";
	}

	return sourcePath;
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
	const queryClient = useQueryClient();
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

	const [acquisitionCategoryId, setAcquisitionCategoryId] = useState("");
	const [isCreatingAcqCategory, setIsCreatingAcqCategory] = useState(false);
	const [newAcqCategoryName, setNewAcqCategoryName] = useState("");
	const [newAcqCategoryColor, setNewAcqCategoryColor] = useState("#6b7280");

	const [individualName, setIndividualName] = useState("");
	const [individualTag, setIndividualTag] = useState("");
	const [individualSex, setIndividualSex] = useState<IndividualSex>("unknown");

	const {
		data: acquisitionCategories = [],
		refetch: refetchAcquisitionCategories,
	} = useListEventCategoriesByFarmId({
		farmId,
		filters: { type: "acquisition" },
		enabled: lotMode === "aggregated",
	});

	const isCreatingNewAcqCategory =
		acquisitionCategoryId === NEW_CATEGORY_OPTION_VALUE;

	const handleCreateAcquisitionCategory = async () => {
		if (!farmId) return;
		if (!newAcqCategoryName.trim()) {
			setMessage("Escribe un nombre para la nueva categoria.");
			return;
		}

		setIsCreatingAcqCategory(true);
		setMessage("");
		try {
			const created = await createEventCategoryByFarmId({
				farmId,
				data: {
					type: "acquisition",
					name: newAcqCategoryName.trim(),
					color: newAcqCategoryColor,
				},
			});
			setAcquisitionCategoryId(String(created.id));
			setNewAcqCategoryName("");
			await refetchAcquisitionCategories();
		} catch {
			setMessage("No se pudo crear la categoria. Intenta con otro nombre.");
		} finally {
			setIsCreatingAcqCategory(false);
		}
	};

	const goBack = () =>
		navigate({
			to: resolveReturnPath(search.sourcePath),
			replace: true,
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
		if (lotMode === "aggregated" && isCreatingNewAcqCategory) {
			setMessage(
				"Completa la creacion de la nueva categoria o elige otra opcion antes de guardar.",
			);
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
						category_id: acquisitionCategoryId
							? Number(acquisitionCategoryId)
							: undefined,
						payload: { source: "initial_asset_setup" },
					},
				});
			}

			await Promise.all([
				queryClient.invalidateQueries({
					queryKey: [...livestockQueryKeys.all, "assetsByFarm", farmId],
				}),
				queryClient.invalidateQueries({
					queryKey: [...livestockQueryKeys.all, "eventsByAsset", farmId],
				}),
				queryClient.invalidateQueries({
					queryKey: [
						...livestockQueryKeys.all,
						"eventsByAssetInfinite",
						farmId,
					],
				}),
			]);

			setMessage("Lote creado.");
			goBack();
		} catch {
			setMessage(
				"No se pudo crear el lote. Revisa los datos e intenta de nuevo.",
			);
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
			await queryClient.invalidateQueries({
				queryKey: [
					...livestockQueryKeys.all,
					"individualsByAsset",
					farmId,
					unitId,
				],
			});
			setMessage("Individual creado.");
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
							<>
								<input
									type="number"
									min="0"
									step="1"
									className="w-full rounded-lg border border-(--v2-border) px-3 py-2 text-sm"
									placeholder="Cantidad inicial de animales"
									value={lotInitialAmount}
									onChange={(event) => setLotInitialAmount(event.target.value)}
								/>
								<div className="space-y-1">
									<p className="text-xs font-medium text-(--v2-ink-soft)">
										Categoria del evento de adquisicion (opcional)
									</p>
									<select
										className="w-full rounded-lg border border-(--v2-border) px-3 py-2 text-sm"
										value={acquisitionCategoryId}
										onChange={(event) =>
											setAcquisitionCategoryId(event.target.value)
										}
									>
										<option value="">Sin categoria</option>
										{acquisitionCategories.map((category) => (
											<option
												key={category.id}
												value={String(category.id)}
											>
												{category.name}
											</option>
										))}
										<option value={NEW_CATEGORY_OPTION_VALUE}>
											+ Nueva categoria
										</option>
									</select>
									{isCreatingNewAcqCategory ? (
										<div className="mt-2 grid gap-2 rounded-lg border border-(--v2-border) bg-white/60 p-2">
											<label className="space-y-1 text-xs">
												<span className="font-medium">Nombre</span>
												<input
													type="text"
													className="w-full rounded-lg border border-(--v2-border) px-3 py-2"
													placeholder="Ej: Compra inicial"
													value={newAcqCategoryName}
													onChange={(event) =>
														setNewAcqCategoryName(event.target.value)
													}
												/>
											</label>
											<label className="space-y-1 text-xs">
												<span className="font-medium">Color</span>
												<input
													type="color"
													className="h-10 w-full rounded-lg border border-(--v2-border) px-1 py-1"
													value={newAcqCategoryColor}
													onChange={(event) =>
														setNewAcqCategoryColor(event.target.value)
													}
												/>
											</label>
											<div className="flex justify-end gap-2">
												<button
													type="button"
													onClick={() => {
														setAcquisitionCategoryId("");
														setNewAcqCategoryName("");
													}}
													className="rounded-full border border-(--v2-border) px-3 py-1 text-xs font-semibold"
												>
													Cancelar
												</button>
												<button
													type="button"
													onClick={() => void handleCreateAcquisitionCategory()}
													disabled={isCreatingAcqCategory || isSaving}
													className="rounded-full border border-(--v2-ink) px-3 py-1 text-xs font-semibold disabled:opacity-60"
												>
													{isCreatingAcqCategory
														? "Creando..."
														: "Crear categoria"}
												</button>
											</div>
										</div>
									) : null}
								</div>
							</>
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
							Abre Acciones rapidas desde un lote para crear un individuo.
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
								placeholder="Identificador"
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
								{isSaving ? "Guardando..." : "Crear individuo"}
							</button>
						</form>
					)}
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
