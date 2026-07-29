import { useState } from "react";
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
	useGetV1FarmById,
	useUpdateV1FarmById,
} from "@/features/farm/api/farm-queries";
import { CurrencyManagementSection } from "@/features/currency/components/currency-management-section";
import { CURRENCY_OPTIONS } from "@/features/farm/constants/currency-options";
import { TimezoneSelect } from "@/features/farm/components/timezone-select";
import { useGetUserProfile } from "@/features/auth/api/auth-queries";

interface FarmSettingsFormProps {
	farmId: string;
}

interface FarmDraft {
	name?: string;
	currency?: string;
	timezone?: string;
}

export const FarmSettingsForm = ({ farmId }: FarmSettingsFormProps) => {
	const [draft, setDraft] = useState<FarmDraft>({});
	const { data: farm, isLoading: isFarmLoading } = useGetV1FarmById(farmId);
	const { data: currentUser } = useGetUserProfile();
	const updateFarmMutation = useUpdateV1FarmById();

	const isOwner = currentUser?.role === "owner";

	const currentName = draft.name ?? farm?.name ?? "";
	const currentCurrency = draft.currency ?? farm?.default_currency ?? "";
	const currentTimezone = draft.timezone ?? farm?.timezone ?? "";
	const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
	const hasChanges = Object.keys(draft).length > 0;

	const handleSave = async () => {
		if (!hasChanges) return;
		if (!currentName.trim()) {
			toast.error("El nombre de la granja es obligatorio.");
			return;
		}

		try {
			await updateFarmMutation.mutateAsync({
				farmId,
				payload: {
					...(draft.name !== undefined ? { name: currentName.trim() } : {}),
					...(draft.currency ? { default_currency: draft.currency } : {}),
					...(draft.timezone ? { timezone: draft.timezone } : {}),
				},
			});
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

	if (!farm) {
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
							disabled={!isOwner}
							onChange={(event) =>
								setDraft((previous) => ({
									...previous,
									name: event.target.value,
								}))
							}
						/>
					</div>
					<div className="space-y-1">
						<Label>Moneda predeterminada</Label>
						<Select
							value={currentCurrency || undefined}
							disabled={!isOwner}
							onValueChange={(value) =>
								setDraft((previous) => ({ ...previous, currency: value }))
							}
						>
							<SelectTrigger>
								<SelectValue placeholder="Selecciona una moneda" />
							</SelectTrigger>
							<SelectContent>
								{CURRENCY_OPTIONS.map((currency) => (
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
					<div className="space-y-1">
						<Label>Zona horaria</Label>
						<TimezoneSelect
							value={currentTimezone}
							disabled={!isOwner}
							onChange={(value) =>
								setDraft((previous) => ({ ...previous, timezone: value }))
							}
						/>
						{isOwner && currentTimezone !== detectedTimezone ? (
							<Button
								type="button"
								variant="ghost"
								size="sm"
								className="h-auto px-0 text-xs text-primary"
								onClick={() =>
									setDraft((previous) => ({
										...previous,
										timezone: detectedTimezone,
									}))
								}
							>
								Usar zona detectada: {detectedTimezone}
							</Button>
						) : null}
						<p className="text-xs text-(--v2-ink-soft)">
							Define qué cuenta como "hoy" al agrupar la producción diaria.
						</p>
					</div>
				</CardContent>
			</Card>

			<CurrencyManagementSection
				farmId={farmId}
				disabled={!isOwner}
			/>

			<div className="flex items-center gap-2">
				<Button
					onClick={() => void handleSave()}
					disabled={!hasChanges || updateFarmMutation.isPending || !isOwner}
				>
					{updateFarmMutation.isPending ? "Guardando..." : "Guardar configuración"}
				</Button>
				<Button
					variant="outline"
					disabled={!hasChanges || updateFarmMutation.isPending}
					onClick={() => setDraft({})}
				>
					Descartar cambios
				</Button>
			</div>
		</div>
	);
};
