import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useGetAnimalsByFarmId } from "@/features/animal/api/animal-queries";

interface ParentsByGenderSelectProps {
	value: string | undefined;
	onChange: (value: string) => void;
	farmId: string;
	sex: "male" | "female";
	include: string;
	withLanguage: boolean;
	placeholder?: string;
}

export const ParentsByGenderSelect = ({
	value,
	onChange,
	farmId,
	sex,
	include,
	withLanguage,
	placeholder = "Select a parent...",
}: ParentsByGenderSelectProps) => {
	const { data: animalsData } = useGetAnimalsByFarmId({
		farmId,
		include,
		withLanguage,
		sex,
	});

	return (
		<Select
			onValueChange={onChange}
			value={value}
		>
			<SelectTrigger>
				<SelectValue placeholder={placeholder} />
			</SelectTrigger>
			<SelectContent>
				{animalsData?.map((animal) => (
					<SelectItem
						key={animal.id}
						value={animal.id}
					>
						{animal.name}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
};
