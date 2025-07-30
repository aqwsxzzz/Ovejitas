import { DateSelector } from "@/components/common/DateSelector";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCreateMeasurement } from "@/features/measurement/api/measurement-queries";
import { MeasurementTypeSelect } from "@/features/measurement/components/measurement-type-select/measurement-type-select";
import type { IMeasurement } from "@/features/measurement/types/measurement";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams } from "@tanstack/react-router";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
	measurementType: z.enum(["weight", "height", "body_condition"] as [
		IMeasurement["measurementType"],
		IMeasurement["measurementType"],
		IMeasurement["measurementType"],
	]),
	value: z.string().min(1, "Please enter a value"),
	unit: z.enum(["kg", "cm", "°C"] as [
		IMeasurement["unit"],
		IMeasurement["unit"],
		IMeasurement["unit"],
	]),
	measuredAt: z.date(),
	notes: z
		.string()
		.max(200, "Notes must be less than 200 characters")
		.optional(),
});

export const AddNewMeasurementForm = ({
	closeDialog,
}: {
	closeDialog: () => void;
}) => {
	const { mutateAsync: createMeasurement, isPending } = useCreateMeasurement();
	const { animalId } = useParams({ strict: false });

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			measurementType: "weight",
			value: "",
			unit: "kg",
			measuredAt: new Date(),
			notes: "",
		},
	});

	// Escuchar el tipo seleccionado para cambiar el sufijo dinámicamente
	const measurementType = useWatch({
		control: form.control,
		name: "measurementType",
	});

	const getUnitSuffix = (type?: string) => {
		switch (type) {
			case "weight":
				form.setValue("unit", "kg");
				return "kg";
			case "height":
				form.setValue("unit", "cm");
				return "cm";
			case "body condition":
				form.setValue("unit", "°C");
				return "°C"; // Preparado para futuro cambio
			default:
				return "";
		}
	};

	const unitSuffix = getUnitSuffix(measurementType);

	const onSubmit = async (data: z.infer<typeof formSchema>) => {
		const formatDate = (date: Date) => {
			const year = date.getFullYear();
			const month = String(date.getMonth() + 1).padStart(2, "0");
			const day = String(date.getDate()).padStart(2, "0");
			return `${year}-${month}-${day}`;
		};
		const response = await createMeasurement({
			payload: {
				measurementType: data.measurementType,
				value: Number(data.value),
				unit: data.unit,
				measuredAt: `${formatDate(data.measuredAt)}T10:30:00Z`,
				notes: data.notes,
			},
			animalId: animalId!,
		});
		if (response.status == "success") {
			closeDialog();
		}
	};

	return (
		<Form {...form}>
			<form
				className="flex flex-col gap-2"
				onSubmit={form.handleSubmit(onSubmit)}
			>
				<FormField
					control={form.control}
					name="measurementType"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Measurement Type</FormLabel>
							<FormControl>
								<MeasurementTypeSelect
									value={field.value}
									onChange={field.onChange}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="value"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Value</FormLabel>
							<FormControl>
								<div className="relative flex items-center">
									<Input
										placeholder="Enter a value"
										{...field}
										type="number"
										step="any"
										className="pr-12" // Deja espacio para el sufijo
									/>
									<span className="absolute right-3 text-sm text-muted-foreground pointer-events-none">
										{unitSuffix}
									</span>
								</div>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="measuredAt"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Measured At</FormLabel>
							<FormControl>
								<DateSelector
									date={field.value ?? undefined}
									setDate={field.onChange}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="notes"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Notes</FormLabel>
							<FormControl>
								<Textarea
									placeholder="Optional notes"
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<div className="flex justify-around">
					<Button
						disabled={isPending}
						type="submit"
					>
						Send
					</Button>
					<Button
						className="bg-destructive"
						onClick={closeDialog}
					>
						Cancel
					</Button>
				</div>
			</form>
		</Form>
	);
};
