import { useCallback, useState } from "react";
import { useNavigate } from "@tanstack/react-router";

import {
	useCreateIndividual,
	useDeleteIndividual,
	useListIndividualsByAssetId,
	useUpdateIndividual,
} from "@/features/livestock/api/livestock-queries";
import type { ILivestockIndividual } from "@/features/livestock/types/livestock-types";

import { IndividualForm } from "../individual-form";
import type { IndividualFormData } from "../individual-form";
import { IndividualList } from "../individual-list";

interface FlockIndividualsSectionProps {
	farmId: string;
	unitId: string;
	eventTypeFilter?: string;
}

export function FlockIndividualsSection({
	farmId,
	unitId,
	eventTypeFilter,
}: FlockIndividualsSectionProps) {
	const navigate = useNavigate();
	const [isCreatingIndividual, setIsCreatingIndividual] = useState(false);
	const [individualSearchQuery, setIndividualSearchQuery] = useState("");

	const { data: allIndividualsResponse } = useListIndividualsByAssetId({
		farmId,
		assetId: unitId,
		filters: { pageSize: 100 },
		enabled: !!farmId && !!unitId,
	});
	const {
		data: listedIndividualsResponse,
		isLoading: isLoadingListedIndividuals,
	} = useListIndividualsByAssetId({
		farmId,
		assetId: unitId,
		filters: {
			q: individualSearchQuery.trim() || undefined,
			sort: "-updated_at",
			pageSize: 20,
		},
		enabled: !!farmId && !!unitId,
	});

	const createIndividualMutation = useCreateIndividual();
	const updateIndividualMutation = useUpdateIndividual();
	const deleteIndividualMutation = useDeleteIndividual();

	const allIndividuals = allIndividualsResponse?.data ?? [];
	const listedIndividuals = listedIndividualsResponse?.data ?? [];

	const handleCreateIndividual = useCallback(
		async (data: IndividualFormData) => {
			await createIndividualMutation.mutateAsync({
				farmId,
				assetId: unitId,
				data: {
					name: data.name ?? "",
					tag: data.tag,
					birth_date: data.birthDate,
					mother_id: data.motherId != null ? Number(data.motherId) : undefined,
					father_id: data.fatherId != null ? Number(data.fatherId) : undefined,
					extra: data.sex ? { sex: data.sex } : undefined,
				},
			});
			setIsCreatingIndividual(false);
		},
		[farmId, unitId, createIndividualMutation],
	);

	const handleDeleteIndividual = useCallback(
		async (individual: ILivestockIndividual) => {
			await deleteIndividualMutation.mutateAsync({
				farmId,
				assetId: unitId,
				individualId: String(individual.id),
			});
		},
		[farmId, unitId, deleteIndividualMutation],
	);

	const handleUpdateIndividual = useCallback(
		async (individual: ILivestockIndividual, data: IndividualFormData) => {
			await updateIndividualMutation.mutateAsync({
				farmId,
				assetId: unitId,
				individualId: String(individual.id),
				data: {
					name: data.name ?? individual.name,
					tag: data.tag,
					mother_id:
						data.motherId != null
							? Number(data.motherId)
							: individual.mother_id,
					father_id:
						data.fatherId != null
							? Number(data.fatherId)
							: individual.father_id,
					status: data.status ?? individual.status,
					extra: {
						...individual.extra,
						...(data.sex !== undefined ? { sex: data.sex } : {}),
					},
				},
			});
		},
		[farmId, unitId, updateIndividualMutation],
	);

	return (
		<div className="rounded-lg border border-gray-200 bg-white p-6">
			{isCreatingIndividual ? (
				<div>
					<h3 className="mb-4 text-lg font-bold">Agregar individuo</h3>
					<IndividualForm
						availableParents={allIndividuals}
						onSubmit={handleCreateIndividual}
						onCancel={() => setIsCreatingIndividual(false)}
						isLoading={createIndividualMutation.isPending}
					/>
				</div>
			) : (
				<IndividualList
					individuals={listedIndividuals}
					availableParents={allIndividuals}
					totalIndividuals={listedIndividualsResponse?.meta.total}
					searchQuery={individualSearchQuery}
					onSearchQueryChange={setIndividualSearchQuery}
					isLoading={isLoadingListedIndividuals}
					onSelectIndividual={(individual) => {
						navigate({
							to: "/v2/production-units/flock/$unitId/individuals/$individualId",
							params: { unitId, individualId: String(individual.id) },
							search: {
								eventType: eventTypeFilter,
								edit: false,
							},
						});
					}}
					onUpdateIndividual={handleUpdateIndividual}
					onDeleteIndividual={handleDeleteIndividual}
					onCreateIndividual={() => setIsCreatingIndividual(true)}
					isUpdatingIndividual={updateIndividualMutation.isPending}
				/>
			)}
		</div>
	);
}
