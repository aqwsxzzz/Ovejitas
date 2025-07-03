export interface IAnimal {
    id: string;
    farmId: string;
    speciesId: string;
    breedId: string;
    name: string;
    tagNumber: string;
    sex: "female" | "male" | "unknown";
    birthDate: string;
    weight: number;
    status: "alive" | "deceased" | "sold";
    reproductiveStatus: "open" | "pregnant" | "lactating" | "other";
    fatherId: string | null;
    motherId: string | null;
    acquisitionType: "born" | "purchased" | "other";
    acquisitionDate: string;
}

export interface IAnimalPayload {
    farmId: string;
}

export interface ICreateAnimalPayload {
    speciesId: string;
    breedId: string;
    name: string;
    tagNumber: string;
    sex: "female" | "male" | "unknown";
    birthDate: string;
    weight: number;
    status: "alive" | "deceased" | "sold";
    reproductiveStatus: "open" | "pregnant" | "lactating" | "other";
    fatherId: string | null;
    motherId: string | null;
    acquisitionType: "born" | "purchased" | "other";
    acquisitionDate: string;
}
