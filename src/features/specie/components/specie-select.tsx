import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useGetSpecies } from "@/features/specie/api/specie.queries";

export const SpecieSelect = ({
	value,
	onChange,
	defaultValue,
}: {
	value: string;
	onChange: (value: string) => void;
	defaultValue?: string;
}) => {
	const include = "";
	const { data: speciesData } = useGetSpecies({ include, withLanguage: true });

	return (
		<Select
			onValueChange={onChange}
			value={value}
			defaultValue={defaultValue}
		>
			<SelectTrigger>
				<SelectValue placeholder="Select a specie.." />
			</SelectTrigger>
			<SelectContent>
				{speciesData?.map((specie) => (
					<SelectItem
						key={specie.id}
						value={specie.id}
					>
						{specie.translations[0].name}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
};
