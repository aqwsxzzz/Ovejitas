import { useState } from "react";

import {
	useCreateMaterialConsumptionByFarmId,
	useListLivestockAssetsByFarmId,
} from "@/features/livestock/api/livestock-queries";
import { MaterialConsumptionForm } from "@/features/inventory/components/material-consumption-form";
import type { IMaterialConsumptionCreatePayload } from "@/features/livestock/api/livestock-api";

import { LogActionCard } from "./log-action-card";
import { LogAssetPicker } from "./log-asset-picker";

interface LogFeedingActionProps {
	farmId: string;
	contextAssetId: string | null;
	title: string;
	subtitle: string;
	onDone: () => void;
}

export function LogFeedingAction({
	farmId,
	contextAssetId,
	title,
	subtitle,
	onDone,
}: LogFeedingActionProps) {
	const [pickedMaterialId, setPickedMaterialId] = useState("");
	const materialAssetId = contextAssetId ?? pickedMaterialId;

	const consumerAssetsQuery = useListLivestockAssetsByFarmId({
		farmId,
		filters: { kind: "animal", page: 1, pageSize: 100 },
		enabled: !!farmId,
	});
	const createConsumption = useCreateMaterialConsumptionByFarmId();
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const handleSubmit = async (payload: IMaterialConsumptionCreatePayload) => {
		setErrorMessage(null);
		try {
			await createConsumption.mutateAsync({ farmId, data: payload });
			onDone();
		} catch {
			setErrorMessage("No se pudo registrar el consumo. Intenta de nuevo.");
		}
	};

	return (
		<LogActionCard
			title={title}
			subtitle={subtitle}
		>
			{!contextAssetId ? (
				<LogAssetPicker
					farmId={farmId}
					value={pickedMaterialId}
					onChange={setPickedMaterialId}
					assetKinds={["material"]}
					label="Material consumido"
				/>
			) : null}

			{materialAssetId ? (
				<MaterialConsumptionForm
					farmId={farmId}
					materialAssetId={Number(materialAssetId)}
					consumerAssets={consumerAssetsQuery.data?.data ?? []}
					isSubmitting={createConsumption.isPending}
					errorMessage={errorMessage}
					onSubmit={handleSubmit}
				/>
			) : (
				<p className="text-sm text-(--v2-ink-soft)">
					Selecciona el material consumido para continuar.
				</p>
			)}
		</LogActionCard>
	);
}
