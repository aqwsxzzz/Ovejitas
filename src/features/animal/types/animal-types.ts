export interface IAnimal {
    id: string;
    farmId: string;
    speciesId: string;
    name: string;
    sex: "female" | "male" | "unknown";
    birthDate: string;
    status: "alive" | "deceased" | "sold";
    reproductiveStatus: "open" | "pregnant" | "lactating" | "other";
    acquisitionType: "born" | "purchased" | "other";
    acquisitionDate: string;
    breedId: string;
    tagNumber: string;
    weight: number;
    parentId: string | null;
    motherId: string | null;
}

export interface IAnimalPayload {
    farmId: string;
}
