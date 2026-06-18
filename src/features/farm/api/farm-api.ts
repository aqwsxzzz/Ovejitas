import { axiosHelper } from "@/lib/axios/axios-helper";
import type {
	IV1Farm,
	IV1FarmUpdatePayload,
} from "@/features/farm/types/farm-types";

/** Read the v1 farm record (source of truth for name + `default_currency`). */
export const getV1FarmById = ({ farmId }: { farmId: string }) =>
	axiosHelper<IV1Farm>({
		method: "get",
		url: `/api/v1/farms/${farmId}`,
	});

/** Update the v1 farm record (name + `default_currency`). */
export const updateV1FarmById = ({
	farmId,
	payload,
}: {
	farmId: string;
	payload: IV1FarmUpdatePayload;
}) =>
	axiosHelper<IV1Farm>({
		method: "patch",
		url: `/api/v1/farms/${farmId}`,
		data: payload,
	});
