export interface IMeasurement {
	id: string;
	animalId: string;
	measurementType: "weight" | "height" | "temperature";
	value: number;
	unit: "kg" | "cm" | "°C";
	measuredAt: string;
	measuredBy: string;
	method: string;
}

export interface ICreateMeasurementPayload {
	measurementType: IMeasurement["measurementType"];
	value: number;
	unit: IMeasurement["unit"];
	measuredAt: string;
	notes?: string;
}
