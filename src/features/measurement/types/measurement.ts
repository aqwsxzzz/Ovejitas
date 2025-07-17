export interface IMeasurement {
	id: string;
	animalId: string;
	measurementType: "weight" | "height" | "body_condition";
	value: number;
	unit: "kg" | "cm";
	measuredAt: string;
	measuredBy: string;
	method: string;
}
