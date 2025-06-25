import { axiosHelper } from "@/lib/axios/axios-helper";
import type { IResponse } from "@/lib/axios";
import type { IAnimal, IAnimalPayload } from "@/features/animal/types/animal-types";

export const getAnimalsByFarmId = ({ payload }: { payload: IAnimalPayload }) =>
    axiosHelper<IResponse<IAnimal[]>>({
        method: "get",
        url: `/farms/${payload.farmId}/animals`,
    });
