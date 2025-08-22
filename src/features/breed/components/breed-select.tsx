import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useGetBreedsBySpecieId } from "@/features/breed/api/breed-queries";

export const BreedSelect = ({
	value,
	onChange,
	specieId,
	defaultValue,
}: {
	value: string;
	onChange: (value: string) => void;
	specieId: string;
	defaultValue?: string;
}) => {
	const { data: breedsData } = useGetBreedsBySpecieId(specieId);

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
				{breedsData?.map((breed) => (
					<SelectItem
						key={breed.id}
						value={breed.id}
					>
						{breed.name}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
};
