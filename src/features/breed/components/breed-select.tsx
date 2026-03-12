import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useGetBreedsBySpeciesId } from "@/features/breed/api/breed-queries";
import { useTranslation } from "react-i18next";

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
	const {
		data: breedsData = [],
		isPending,
		error,
	} = useGetBreedsBySpeciesId(specieId, "name:asc");
	const { t } = useTranslation("breedSelect");

	return (
		<div>
			<Select
				onValueChange={onChange}
				value={value}
				defaultValue={defaultValue}
			>
				<SelectTrigger className="w-full">
					<SelectValue placeholder={t("selectBreedPlaceholder")} />
				</SelectTrigger>
				<SelectContent>
					{isPending && (
						<SelectItem
							value="loading"
							disabled
						>
							Loading...
						</SelectItem>
					)}
					{error instanceof Error && (
						<SelectItem
							value="error"
							disabled
						>
							{error.message}
						</SelectItem>
					)}
					{!isPending && !error && breedsData.length === 0 && (
						<SelectItem
							value="no-data"
							disabled
						>
							No breeds available
						</SelectItem>
					)}
					{breedsData.map((breed) => (
						<SelectItem
							key={breed.id}
							value={breed.id}
						>
							{breed.name}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	);
};
