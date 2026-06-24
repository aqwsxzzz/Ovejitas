import { useCallback } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useGetUserProfile } from "@/features/auth/api/auth-queries";
import {
	useGetIndividualById,
	useListIndividualsByAssetId,
	useUpdateIndividual,
	useDeleteIndividual,
} from "@/features/livestock/api/livestock-queries";
import { IndividualDetail } from "../components/individual-detail";
import { RecordBirthForm } from "@/features/livestock/components/record-birth-form";
import { IndividualTimelineReport } from "@/features/reports/components/individual-timeline-report";
import { PregnancyCheckForm } from "@/features/pregnancy/components/pregnancy-check-form";
import type { ILivestockIndividual } from "@/features/livestock/types/livestock-types";

interface IndividualDetailPageProps {
	assetId: string;
	individualId: string;
	startEditing?: boolean;
}

export function IndividualDetailPage({
	assetId,
	individualId,
	startEditing = false,
}: IndividualDetailPageProps) {
	const navigate = useNavigate();
	const { data: currentUser } = useGetUserProfile();
	const farmId = currentUser?.lastVisitedFarmId ?? "";

	const { data: individual, isLoading: isLoadingIndividual } =
		useGetIndividualById({
			farmId,
			assetId,
			individualId,
			enabled: !!farmId && !!assetId && !!individualId,
		});

	const { data: individualsResponse, isLoading: isLoadingList } =
		useListIndividualsByAssetId({
			farmId,
			assetId,
			filters: { pageSize: 100 }, // Get all for genealogy
			enabled: !!farmId && !!assetId,
		});

	const allIndividuals = individualsResponse?.data ?? [];

	const updateIndividualMutation = useUpdateIndividual();
	const deleteIndividualMutation = useDeleteIndividual();
	const isMutating =
		updateIndividualMutation.isPending || deleteIndividualMutation.isPending;

	const handleUpdate = useCallback(
		async (updated: ILivestockIndividual) => {
			if (!farmId || !assetId) return;

			await updateIndividualMutation.mutateAsync({
				farmId,
				assetId,
				individualId,
				data: {
					name: updated.name,
					tag: updated.tag,
					status: updated.status,
					mother_id: updated.mother_id,
					father_id: updated.father_id,
					extra: updated.extra,
				},
			});
		},
		[farmId, assetId, individualId, updateIndividualMutation],
	);

	const handleDelete = useCallback(async () => {
		if (!farmId || !assetId) return;

		await deleteIndividualMutation.mutateAsync({
			farmId,
			assetId,
			individualId,
		});

		// Navigate back to asset detail
		navigate({
			to: `/v2/production-units/flock/$unitId`,
			params: { unitId: assetId },
			search: { eventType: undefined },
		});
	}, [farmId, assetId, individualId, navigate]);

	if (isLoadingIndividual || isLoadingList) {
		return (
			<div className="flex justify-center py-8">
				<div className="animate-spin text-muted-foreground">⏳</div>
			</div>
		);
	}

	if (!individual) {
		return (
			<div className="rounded-lg border border-destructive/30 bg-destructive/10 p-6 text-center text-destructive">
				No se encontro el individuo
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<Button
				variant="link"
				onClick={() =>
					navigate({
						to: `/v2/production-units/flock/$unitId`,
						params: { unitId: assetId },
						search: { eventType: undefined },
					})
				}
				className="h-auto p-0 text-sm text-info"
			>
				← Volver al lote
			</Button>

			<IndividualDetail
				individual={individual}
				allIndividuals={allIndividuals}
				onUpdate={handleUpdate}
				onDelete={handleDelete}
				isLoading={isMutating}
				startEditing={startEditing}
			/>

			<PregnancyCheckForm
				farmId={farmId}
				individualId={individual.id}
			/>

			{individual.status === "active" ? (
				<RecordBirthForm
					farmId={farmId}
					assetId={assetId}
					motherId={individual.id}
					candidateParents={allIndividuals.filter(
						(candidate) => candidate.id !== individual.id,
					)}
				/>
			) : null}

			<IndividualTimelineReport
				farmId={farmId}
				individualId={individual.id}
			/>
		</div>
	);
}
