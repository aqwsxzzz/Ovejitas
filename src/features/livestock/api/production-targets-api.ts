import { axiosHelper } from "@/lib/axios/axios-helper";
import type {
	IAssetProductionTargetCreatePayload,
	IAssetProductionTargetListResponse,
	IAssetProductionTargetRead,
	IAssetProductionTargetUpdatePayload,
} from "@/features/livestock/types/production-targets-types";

/** List production targets in a farm */
export const listProductionTargetsByFarmId = ({
	farmId,
}: {
	farmId: string;
}) =>
	axiosHelper<IAssetProductionTargetListResponse>({
		method: "get",
		url: `/api/v1/farms/${farmId}/production-targets`,
	});

/** Create a production target (a rate change is a new effective-dated target) */
export const createProductionTargetByFarmId = ({
	farmId,
	data,
}: {
	farmId: string;
	data: IAssetProductionTargetCreatePayload;
}) =>
	axiosHelper<IAssetProductionTargetRead>({
		method: "post",
		url: `/api/v1/farms/${farmId}/production-targets`,
		data,
	});

/** Update a target: adjust rate, close effective_to, or archive */
export const updateProductionTargetById = ({
	farmId,
	targetId,
	data,
}: {
	farmId: string;
	targetId: number;
	data: IAssetProductionTargetUpdatePayload;
}) =>
	axiosHelper<IAssetProductionTargetRead>({
		method: "patch",
		url: `/api/v1/farms/${farmId}/production-targets/${targetId}`,
		data,
	});

/** Delete a production target */
export const deleteProductionTargetById = ({
	farmId,
	targetId,
}: {
	farmId: string;
	targetId: number;
}) =>
	axiosHelper<void>({
		method: "delete",
		url: `/api/v1/farms/${farmId}/production-targets/${targetId}`,
	});
