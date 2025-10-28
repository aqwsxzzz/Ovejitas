import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useGetSpecies } from "@/features/specie/api/specie.queries";
import { useTranslation } from "react-i18next";

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
	const { data: speciesData, isPending } = useGetSpecies({ include, withLanguage: true });
	const { t } = useTranslation("specieSelect");



	return (
		<Select
			onValueChange={onChange}
			value={value}
			defaultValue={defaultValue}
		>
			<SelectTrigger>
				<SelectValue placeholder={t("selectTriggerPlaceholder")} />
			</SelectTrigger>
			<SelectContent>
				{isPending && <SelectItem value="loading" disabled>Loading...</SelectItem>}
				{!isPending && speciesData
					?.filter(specie => specie.translations?.[0]?.name)
					?.map((specie) => (
						<SelectItem
							key={specie.id}
							value={specie.id}
						>
							{specie.translations![0].name}
						</SelectItem>
					))}
			</SelectContent>
		</Select>
	);
};
