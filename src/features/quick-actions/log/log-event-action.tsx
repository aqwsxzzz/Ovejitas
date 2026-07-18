import { useState } from "react";

import {
	useCreateEventByAssetId,
	useCreateEventCategoryByFarmId,
	useGetLivestockAssetById,
	useListEventCategoriesByFarmId,
	useListIndividualsByAssetId,
} from "@/features/livestock/api/livestock-queries";
import { toCreateEventPayload } from "@/features/livestock/components/flock-detail/flock-event-payloads";
import { UnitEventForm } from "@/features/livestock/components/unit-event-form";
import type { UnitEventFormData } from "@/features/livestock/components/unit-event-form";
import type {
	LivestockAssetKind,
	LivestockEventType,
} from "@/features/livestock/types/livestock-types";

import { LogActionCard } from "./log-action-card";
import { LogAssetPicker } from "./log-asset-picker";

interface LogEventActionProps {
	farmId: string;
	contextAssetId: string | null;
	eventType: LivestockEventType;
	title: string;
	subtitle: string;
	assetKinds?: readonly LivestockAssetKind[];
	onDone: () => void;
}

const TODAY_ISO = () => new Date().toISOString();

export function LogEventAction({
	farmId,
	contextAssetId,
	eventType,
	title,
	subtitle,
	assetKinds,
	onDone,
}: LogEventActionProps) {
	const [pickedAssetId, setPickedAssetId] = useState("");
	const assetId = contextAssetId ?? pickedAssetId;

	const assetQuery = useGetLivestockAssetById({
		farmId,
		assetId: Number(assetId),
		enabled: !!farmId && !!assetId,
	});
	const categoriesQuery = useListEventCategoriesByFarmId({ farmId });
	const individualsQuery = useListIndividualsByAssetId({
		farmId,
		assetId,
		filters: { page: 1, pageSize: 100, status: "active" },
		enabled: !!farmId && !!assetId && assetQuery.data?.mode === "individual",
	});

	const createEvent = useCreateEventByAssetId();
	const createCategory = useCreateEventCategoryByFarmId();

	const handleSubmit = async (data: UnitEventFormData) => {
		await createEvent.mutateAsync({
			farmId,
			assetId,
			data: toCreateEventPayload(data),
		});
		onDone();
	};

	const handleCreateCategory = async (input: {
		type: LivestockEventType;
		name: string;
		color?: string;
	}) => {
		const created = await createCategory.mutateAsync({ farmId, data: input });
		return created.id;
	};

	return (
		<LogActionCard
			title={title}
			subtitle={subtitle}
		>
			{!contextAssetId ? (
				<LogAssetPicker
					farmId={farmId}
					value={pickedAssetId}
					onChange={setPickedAssetId}
					assetKinds={assetKinds}
				/>
			) : null}

			{assetId && assetQuery.data ? (
				<UnitEventForm
					farmId={farmId}
					categories={categoriesQuery.data ?? []}
					individuals={individualsQuery.data?.data ?? []}
					assetKind={assetQuery.data.kind}
					assetMode={assetQuery.data.mode}
					onSubmit={handleSubmit}
					onCancel={onDone}
					isSubmitting={createEvent.isPending}
					onCreateEventCategory={handleCreateCategory}
					initialValues={{
						type: eventType,
						status: "logged",
						occurredAt: TODAY_ISO(),
					}}
					submitLabel="Guardar registro"
				/>
			) : (
				<p className="text-sm text-(--v2-ink-soft)">
					Selecciona un activo para continuar.
				</p>
			)}
		</LogActionCard>
	);
}
