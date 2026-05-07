import { useCallback } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useGetUserProfile } from "@/features/auth/api/auth-queries";
import {
	useGetIndividualById,
	useListIndividualsByAssetId,
} from "@/features/livestock/api/livestock-queries";
import { IndividualDetail } from "../components/individual-detail";
import {
	updateIndividual as apiUpdateIndividual,
	deleteIndividual as apiDeleteIndividual,
} from "@/features/livestock/api/livestock-api";
import type { ILivestockIndividual } from "@/features/livestock/types/livestock-types";

interface IndividualDetailPageProps {
	assetId: string;
	individualId: string;
}

export function IndividualDetailPage({
	assetId,
	individualId,
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

	const handleUpdate = useCallback(
		async (updated: ILivestockIndividual) => {
			if (!farmId || !assetId) return;

			await apiUpdateIndividual({
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
		[farmId, assetId, individualId],
	);

	const handleDelete = useCallback(async () => {
		if (!farmId || !assetId) return;

		await apiDeleteIndividual({
			farmId,
			assetId,
			individualId,
		});

		// Navigate back to asset detail
		navigate({
			to: `/v2/production-units/flock/$unitId`,
			params: { unitId: assetId },
		});
	}, [farmId, assetId, individualId, navigate]);

	if (isLoadingIndividual || isLoadingList) {
		return (
			<div className="flex justify-center py-8">
				<div className="animate-spin text-gray-400">⏳</div>
			</div>
		);
	}

	if (!individual) {
		return (
			<div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center text-red-700">
				Individual not found
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<button
				onClick={() =>
					navigate({
						to: `/v2/production-units/flock/$unitId`,
						params: { unitId: assetId },
					})
				}
				className="text-sm text-blue-600 hover:underline"
			>
				← Back to Unit
			</button>

			<IndividualDetail
				individual={individual}
				allIndividuals={allIndividuals}
				onUpdate={handleUpdate}
				onDelete={handleDelete}
				isLoading={isLoadingIndividual}
			/>
		</div>
	);
}
