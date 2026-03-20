export type MeasurementType = "weight" | "height" | "temperature";

export interface IMeasurement {
	id: string;
	animalId: string;
	measurementType: MeasurementType;
	value: number;
	unit: "kg" | "cm" | "celsius";
	measuredAt: string;
	measuredBy: string;
	method: string;
	notes?: string | null;
	change?: number | null;
	changePercent?: number | null;
}

export interface ICreateMeasurementPayload {
	measurementType: MeasurementType;
	value: number;
	unit: IMeasurement["unit"];
	measuredAt: string;
	notes?: string;
}

export interface IDeleteMeasurementResponse {
	messages: string;
}
