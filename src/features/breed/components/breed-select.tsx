import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useGetBreedsBySpeciesId } from "@/features/breed/api/breed-queries";
import { getBreedDisplayName } from "@/features/breed/types/breed";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

const OTHER_BREED_LABELS = [
	"other",
	"others",
	"otro",
	"otros",
	"otra",
	"otras",
];

const isOtherBreedLabel = (label: string): boolean => {
	const normalizedLabel = label.trim().toLowerCase();
	return OTHER_BREED_LABELS.includes(normalizedLabel);
};

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
	} = useGetBreedsBySpeciesId(specieId, {
		includeTranslations: true,
		withLanguage: true,
	});
	const { t, i18n } = useTranslation("breedSelect");
	const language = i18n.language.slice(0, 2);
	const sortedBreeds = useMemo(() => {
		const breeds = [...breedsData];

		return breeds.sort((left, right) => {
			const leftLabel = getBreedDisplayName(left, language);
			const rightLabel = getBreedDisplayName(right, language);
			const leftIsOther = isOtherBreedLabel(leftLabel);
			const rightIsOther = isOtherBreedLabel(rightLabel);

			if (leftIsOther && !rightIsOther) {
				return 1;
			}

			if (!leftIsOther && rightIsOther) {
				return -1;
			}

			return leftLabel.localeCompare(rightLabel);
		});
	}, [breedsData, language]);

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
					{sortedBreeds.map((breed) => (
						<SelectItem
							key={breed.id}
							value={breed.id}
						>
							{getBreedDisplayName(breed, language)}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	);
};
