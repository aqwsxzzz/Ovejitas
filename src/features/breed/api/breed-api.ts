import { axiosHelper } from "@/lib/axios/axios-helper";
import type { IResponse } from "@/lib/axios";
import type { IBreed } from "@/features/breed/types/breed-types";

export const getBreedsBySpecieId = ({ speciesId }: { speciesId: string }) => {
    return axiosHelper<IResponse<IBreed[]>>({
        method: "get",
        url: "/breeds",
        urlParams: { speciesId },
    });
};
