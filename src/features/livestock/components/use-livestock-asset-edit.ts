import { useState } from "react";

import {
	useDeleteLivestockAssetById,
	useUpdateLivestockAssetById,
} from "@/features/livestock/api/livestock-queries";

export function useLivestockAssetEdit(farmId: string) {
	const [editingAssetId, setEditingAssetId] = useState<number | null>(null);
	const [editName, setEditName] = useState("");
	const [editLocation, setEditLocation] = useState("");
	const [editDescription, setEditDescription] = useState("");
	const [deletingAssetId, setDeletingAssetId] = useState<number | null>(null);

	const updateAssetMutation = useUpdateLivestockAssetById();
	const deleteAssetMutation = useDeleteLivestockAssetById();

	const startEdit = (
		id: number,
		name: string,
		location: string | null,
		description: string | null,
	) => {
		setEditingAssetId(id);
		setEditName(name);
		setEditLocation(location ?? "");
		setEditDescription(description ?? "");
	};

	const cancelEdit = () => setEditingAssetId(null);

	const saveEdit = async () => {
		if (!farmId || editingAssetId == null || !editName.trim()) return;

		await updateAssetMutation.mutateAsync({
			farmId,
			assetId: editingAssetId,
			data: {
				name: editName.trim(),
				location: editLocation.trim() || null,
				description: editDescription.trim() || null,
			},
		});

		setEditingAssetId(null);
	};

	const deleteAsset = async (assetId: number) => {
		if (!farmId) return;

		setDeletingAssetId(assetId);
		try {
			await deleteAssetMutation.mutateAsync({ farmId, assetId });
			if (editingAssetId === assetId) setEditingAssetId(null);
		} finally {
			setDeletingAssetId(null);
		}
	};

	return {
		editingAssetId,
		editName,
		editLocation,
		editDescription,
		deletingAssetId,
		isUpdatePending: updateAssetMutation.isPending,
		startEdit,
		cancelEdit,
		saveEdit,
		setEditName,
		setEditLocation,
		setEditDescription,
		deleteAsset,
	};
}
