import { useMemo, useState } from "react";
import { LoadingState } from "@/components/common/loading-state";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	useGetFarmById,
	useGetFarmCurrencies,
	useGetV1FarmById,
	useUpdateFarmById,
	useUpdateV1FarmById,
} from "@/features/farm/api/farm-queries";
import { useGetUserProfile } from "@/features/auth/api/auth-queries";
import { useGetFarmMembers } from "@/features/farm-members/api/farm-members-queries";
import { FarmLocationPicker } from "@/features/farm/components/farm-location-picker";

interface FarmSettingsFormProps {
	farmId: string;
}

interface FarmDraft {
	name?: string;
	currency?: string | null;
	latitude?: number | null;
	longitude?: number | null;
}

const buildUpdatePayload = (draft: FarmDraft) => ({
	...(draft.name !== undefined ? { name: draft.name } : {}),
	...(draft.latitude !== undefined ? { latitude: draft.latitude } : {}),
	...(draft.longitude !== undefined ? { longitude: draft.longitude } : {}),
});

export const FarmSettingsForm = ({ farmId }: FarmSettingsFormProps) => {
	const [draft, setDraft] = useState<FarmDraft>({});
	const { data: farmData, isLoading: isFarmLoading } = useGetFarmById(farmId);
	const { data: v1Farm } = useGetV1FarmById(farmId);
	const { data: currencyOptions = [], isLoading: isCurrenciesLoading } =
		useGetFarmCurrencies();
	const { data: currentUser } = useGetUserProfile();
	const { data: farmMembers, isLoading: isMembersLoading } = useGetFarmMembers({
		farmId,
	});
	const updateFarmMutation = useUpdateFarmById();
	const updateV1FarmMutation = useUpdateV1FarmById();
	const isSaving =
		updateFarmMutation.isPending || updateV1FarmMutation.isPending;

	const isOwner = isMembersLoading
		? true // optimistic while loading
		: (farmMembers ?? []).some(
				(member) =>
					member.userId === currentUser?.id && member.role === "owner",
			);

	const currentName = draft.name ?? farmData?.name ?? "";
	const currentCurrency = draft.currency ?? v1Farm?.default_currency ?? "";
	const currentLatitude = draft.latitude ?? farmData?.latitude ?? null;
	const currentLongitude = draft.longitude ?? farmData?.longitude ?? null;
	const hasChanges = Object.keys(draft).length > 0;

	const coordinatesPreview = useMemo(() => {
		if (currentLatitude == null || currentLongitude == null)
			return "Sin definir";
		return `${currentLatitude.toFixed(6)}, ${currentLongitude.toFixed(6)}`;
	}, [currentLatitude, currentLongitude]);

	const handleSave = async () => {
		if (!hasChanges) return;
		if (!currentName.trim()) {
			toast.error("El nombre de la granja es obligatorio.");
			return;
		}

		try {
			const tasks: Promise<unknown>[] = [];

			// Name and location live on the legacy farm endpoint.
			if (
				draft.name !== undefined ||
				draft.latitude !== undefined ||
				draft.longitude !== undefined
			) {
				tasks.push(
					updateFarmMutation.mutateAsync({
						farmId,
						payload: buildUpdatePayload({ ...draft, name: currentName.trim() }),
					}),
				);
			}

			// Currency is owned by the v1 farm record (the event ledger reads it).
			if (draft.currency) {
				tasks.push(
					updateV1FarmMutation.mutateAsync({
						farmId,
						payload: { default_currency: draft.currency },
					}),
				);
			}

			await Promise.all(tasks);
			setDraft({});
			toast.success("Configuración de la granja actualizada.");
		} catch (error) {
			toast.error(
				error instanceof Error
					? error.message
					: "No se pudo actualizar la configuración de la granja.",
			);
		}
	};

	if (isFarmLoading) {
		return <LoadingState message="Cargando configuración..." />;
	}

	if (!farmData) {
		return (
			<p className="text-sm text-destructive">
				No se pudieron cargar los datos de la granja.
			</p>
		);
	}

	return (
		<div className="space-y-4">
			{!isOwner ? (
				<div className="rounded-md border border-warning/50 bg-warning/10 px-4 py-3 text-sm text-warning">
					Solo los dueños de la granja pueden cambiar esta configuración.
				</div>
			) : null}
			<Card>
				<CardHeader>
					<CardTitle>Identidad de la granja</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3">
					<div className="space-y-1">
						<Label htmlFor="farm-name">Nombre de la granja</Label>
						<Input
							id="farm-name"
							value={currentName}
							onChange={(event) =>
								setDraft((previous) => ({
									...previous,
									name: event.target.value,
								}))
							}
						/>
					</div>
					<div className="space-y-1">
						<Label>Moneda</Label>
						<Select
							value={currentCurrency || undefined}
							onValueChange={(value) =>
								setDraft((previous) => ({ ...previous, currency: value }))
							}
						>
							<SelectTrigger>
								<SelectValue
									placeholder={
										isCurrenciesLoading
											? "Cargando monedas..."
											: "Selecciona una moneda"
									}
								/>
							</SelectTrigger>
							<SelectContent>
								{currencyOptions.map((currency) => (
									<SelectItem
										key={currency.code}
										value={currency.code}
									>
										{currency.code} - {currency.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Ubicación</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3">
					<FarmLocationPicker
						latitude={currentLatitude}
						longitude={currentLongitude}
						onChange={({ latitude, longitude }) =>
							setDraft((previous) => ({ ...previous, latitude, longitude }))
						}
					/>
					<p className="text-sm text-muted-foreground">
						Coordenadas seleccionadas: {coordinatesPreview}
					</p>
				</CardContent>
			</Card>

			<div className="flex items-center gap-2">
				<Button
					onClick={() => void handleSave()}
					disabled={!hasChanges || isSaving || !isOwner}
				>
					{isSaving ? "Guardando..." : "Guardar configuración"}
				</Button>
				<Button
					variant="outline"
					disabled={!hasChanges || isSaving}
					onClick={() => setDraft({})}
				>
					Descartar cambios
				</Button>
			</div>
		</div>
	);
};
