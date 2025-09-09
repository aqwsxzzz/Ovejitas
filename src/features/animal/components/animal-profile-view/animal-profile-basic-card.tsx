import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useGetAnimalById } from "@/features/animal/api/animal-queries";
import { useParams } from "@tanstack/react-router";
import dayjs from "dayjs";
import type { TFunction } from "i18next";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

export const AnimalProfileCard = () => {
	const { animalId } = useParams({ strict: false });
	const include = "breed,species";
	const { data: animalData } = useGetAnimalById({
		animalId: animalId!,
		include,
		withLanguage: true,
	});
	const { t } = useTranslation("animalProfileBasicCard");

	const getHealthStatusColor = (status: string) => {
		switch (status) {
			case "alive":
				return "bg-green-100 text-green-800 border-green-200";
			case "deceased":
				return "bg-red-100 text-red-800 border-red-200";
			case "sold":
				return "bg-yellow-100 text-yellow-800 border-yellow-200";
			default:
				return "bg-gray-100 text-gray-800 border-gray-200";
		}
	};

	useEffect(() => {
		console.log(animalData, "here");
	}, [animalData]);

	const calculateAgeFloor = (
		birthDate: string,
		t: TFunction<"animalProfileBasicCard">,
	) => {
		const age = dayjs().diff(dayjs(birthDate), "year", true);
		if (age >= 1) {
			return `${Math.floor(age)} ${t("Year")}${Math.floor(age) > 1 ? "s" : ""}`;
		} else {
			const months = Math.floor(age * 12);
			return `${months} ${t("Month")}${months > 1 ? t("MonthExtension") : ""}`;
		}
	};

	if (!animalData) {
		return (
			<div className="text-center text-gray-500">{t("missingAnimal")}</div>
		);
	}

	return (
		<Card className="bg-white border-primary ">
			<CardContent className="p-6">
				<div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
					<div className="w-32 h-32 bg-background rounded-full flex items-center justify-center flex-shrink-0">
						<img
							src={"/placeholder.svg"}
							alt={animalData.name ?? ""}
							className="w-28 h-28 rounded-full object-cover"
						/>
					</div>
					<div className="flex-1 text-center sm:text-left">
						<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
							<div>
								<h2 className="text-2xl font-bold text-foreground">
									{animalData.name}
								</h2>
								<p className="text-muted-foreground">{animalData.breed.name}</p>
							</div>
							<Badge
								className={`${getHealthStatusColor(animalData.status ?? "")} mt-2 sm:mt-0 text-foreground`}
							>
								{animalData.status}
							</Badge>
						</div>

						<div className="grid grid-cols-2 gap-4 text-sm">
							<div>
								<p className="text-foreground">{t("AgeTitle")}</p>
								<p className="font-medium text-muted-foreground">
									{animalData.birthDate
										? calculateAgeFloor(animalData.birthDate, t)
										: "No Data"}
								</p>
							</div>
							<div>
								<p className="text-foreground">{t("WeightTitle")}</p>
								<p className="font-medium text-muted-foreground">
									{animalData.lastMeasurement?.value}
								</p>
							</div>
							<div>
								<p className="text-foreground">{t("LocationTitle")}</p>
								<p className="font-medium text-muted-foreground">
									{animalData.reproductiveStatus}
								</p>
							</div>
							<div>
								<p className="text-foreground">{t("LastCheckupTitle")}</p>
								<p className="font-medium text-muted-foreground">
									{animalData.name}
								</p>
							</div>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
};
