import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useGetBreedsBySpeciesId } from "@/features/breed/api/breed-queries";
import type { BreedOrder } from "@/features/breed/types/breed";
import { useState } from "react";
import { useTranslation } from "react-i18next";

const ORDER_OPTIONS: Array<{ value: BreedOrder; label: string }> = [
	{ value: "name:asc", label: "Name (A-Z)" },
	{ value: "name:desc", label: "Name (Z-A)" },
	{ value: "id:asc", label: "ID (Ascending)" },
	{ value: "id:desc", label: "ID (Descending)" },
	{ value: "createdAt:asc", label: "Created (Oldest first)" },
	{ value: "createdAt:desc", label: "Created (Newest first)" },
];

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
	const [order, setOrder] = useState<BreedOrder>("name:asc");
	const {
		data: breedsData = [],
		isPending,
		error,
	} = useGetBreedsBySpeciesId(specieId, order);
	const { t } = useTranslation("breedSelect");

	return (
		<div className="space-y-2">
			<Select
				value={order}
				onValueChange={(newOrder) => setOrder(newOrder as BreedOrder)}
			>
				<SelectTrigger className="w-full">
					<SelectValue placeholder="Sort breeds" />
				</SelectTrigger>
				<SelectContent>
					{ORDER_OPTIONS.map((option) => (
						<SelectItem
							key={option.value}
							value={option.value}
						>
							{option.label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>

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
