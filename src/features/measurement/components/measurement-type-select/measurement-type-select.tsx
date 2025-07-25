import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

export const MeasurementTypeSelect = ({
	value,
	onChange,
}: {
	value: string;
	onChange: (value: string) => void;
}) => {
	const measurementTypeData = [
		{ id: 1, name: "Weight" },
		{ id: 2, name: "Height" },
		{ id: 3, name: "Body Condition" },
	];

	return (
		<Select
			onValueChange={onChange}
			value={value}
		>
			<SelectTrigger>
				<SelectValue placeholder="Select a type.." />
			</SelectTrigger>
			<SelectContent>
				{measurementTypeData?.map((type) => (
					<SelectItem
						key={type.id}
						value={type.name.toLowerCase()}
					>
						{type.name}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
};
