import { axiosHelper } from "@/lib/axios/axios-helper";
import type { IResponse } from "@/lib/axios";
import type { IAnimal, ICreateAnimalPayload } from "@/features/animal/types/animal-types";

export const getAnimalsByFarmId = ({ farmId }: { farmId: string }) =>
    axiosHelper<IResponse<IAnimal[]>>({
        method: "get",
        url: `/farms/${farmId}/animals`,
    });

export const createAnimal = ({ payload, farmId }: { payload: ICreateAnimalPayload; farmId: string }) =>
    axiosHelper<IResponse<IAnimal>>({
        method: "post",
        url: `/farms/${farmId}/animals`,
        data: payload,
    });
