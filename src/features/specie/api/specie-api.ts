import { axiosHelper } from "@/lib/axios/axios-helper";
import type { ISpecie } from "@/features/specie/types/specie-types";
import type { IResponse } from "@/lib/axios";

export const getSpecies = ({ language }: { language: string }) => {
    return axiosHelper<IResponse<ISpecie[]>>({
        method: "get",
        url: "/species",
        urlParams: { language },
    });
};
