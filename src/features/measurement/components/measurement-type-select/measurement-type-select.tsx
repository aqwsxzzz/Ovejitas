import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "react-i18next";

export const MeasurementTypeSelect = ({
	value,
	onChange,
}: {
	value: string;
	onChange: (value: string) => void;
}) => {
	const { t } = useTranslation("measurementTypeSelect");

	const measurementTypeData = [
		{ id: 1, name: t("measurementTypeWeight"), value: "weight" },
		{ id: 2, name: t("measurementTypeHeight"), value: "height" },
		{ id: 3, name: t("measurementTypeTemperature"), value: "temperature" },
	];

	return (
		<Select
			onValueChange={onChange}
			value={value}
		>
			<SelectTrigger>
				<SelectValue placeholder={t("selectValuePlaceholder")} />
			</SelectTrigger>
			<SelectContent>
				{measurementTypeData?.map((type) => (
					<SelectItem
						key={type.id}
						value={type.value}
					>
						{type.name}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
};
