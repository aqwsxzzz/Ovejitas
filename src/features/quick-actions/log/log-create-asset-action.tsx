import { useState } from "react";
import type { FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateLivestockAsset } from "@/features/livestock/api/livestock-queries";
import type { LivestockAssetKind } from "@/features/livestock/types/livestock-types";

import { LogActionCard } from "./log-action-card";

interface LogCreateAssetActionProps {
	farmId: string;
	assetKind: LivestockAssetKind;
	title: string;
	submitLabel: string;
	onDone: () => void;
}

export function LogCreateAssetAction({
	farmId,
	assetKind,
	title,
	submitLabel,
	onDone,
}: LogCreateAssetActionProps) {
	const [name, setName] = useState("");
	const [location, setLocation] = useState("");
	const [description, setDescription] = useState("");
	const [error, setError] = useState<string | null>(null);
	const createAsset = useCreateLivestockAsset();

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!name.trim()) return;
		setError(null);
		try {
			await createAsset.mutateAsync({
				farmId,
				data: {
					name: name.trim(),
					location: location.trim() || undefined,
					description: description.trim() || undefined,
					kind: assetKind,
					mode: "aggregated",
				},
			});
			onDone();
		} catch {
			setError("No se pudo crear el activo. Intenta de nuevo.");
		}
	};

	return (
		<LogActionCard
			title={title}
			subtitle="Este flujo crea un nuevo activo para el tipo seleccionado."
		>
			<form
				className="space-y-3"
				onSubmit={(event) => void handleSubmit(event)}
			>
				<div className="space-y-1.5">
					<Label htmlFor="asset-name">Nombre</Label>
					<Input
						id="asset-name"
						value={name}
						onChange={(event) => setName(event.target.value)}
					/>
				</div>
				<div className="space-y-1.5">
					<Label htmlFor="asset-location">Ubicacion</Label>
					<Input
						id="asset-location"
						value={location}
						onChange={(event) => setLocation(event.target.value)}
					/>
				</div>
				<div className="space-y-1.5">
					<Label htmlFor="asset-description">Descripcion</Label>
					<Textarea
						id="asset-description"
						rows={3}
						value={description}
						onChange={(event) => setDescription(event.target.value)}
					/>
				</div>
				{error ? <p className="text-sm text-destructive">{error}</p> : null}
				<div className="flex justify-end">
					<Button
						type="submit"
						variant="default"
						disabled={createAsset.isPending}
					>
						{createAsset.isPending ? "Guardando..." : submitLabel}
					</Button>
				</div>
			</form>
		</LogActionCard>
	);
}
