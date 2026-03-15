import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { HealthStatusIndicator } from "@/components/common/health-status-indicator";
import { useGetAnimalById } from "@/features/animal/api/animal-queries";
import type { IAnimal } from "@/features/animal/types/animal-types";
import { getBreedDisplayName } from "@/features/breed/types/breed";
import { useParams } from "@tanstack/react-router";
import dayjs from "dayjs";
import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";

export const AnimalProfileCard = () => {
	const { animalId } = useParams({ strict: false });
	const include = "breed,species";
	const { data: animalData } = useGetAnimalById({
		animalId: animalId!,
		include,
		withLanguage: true,
	});
	const { t, i18n } = useTranslation("animalProfileBasicCard");

	const getLocalizedStatus = (status: IAnimal["status"]) => {
		if (!status) {
			return t("unknownStatus");
		}

		return t(`statusOptions.${status}`);
	};

	const getLocalizedReproductiveStatus = (
		reproductiveStatus: IAnimal["reproductiveStatus"] | null,
	) => {
		if (!reproductiveStatus) {
			return t("missingData");
		}

		return t(`reproductiveStatusOptions.${reproductiveStatus}`);
	};

	const getHealthStatusVariant = (
		status: string,
	): "success" | "error" | "info" | "secondary" => {
		switch (status) {
			case "alive":
				return "success";
			case "deceased":
				return "error";
			case "sold":
				return "info";
			default:
				return "secondary";
		}
	};

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
		<Card className="rounded-card shadow-card">
			<CardContent className="p-4 space-y-4">
				{/* Name and breed with health indicator and status badge */}
				<div className="flex items-center gap-3">
					<HealthStatusIndicator
						status={animalData.status}
						className="mt-1"
					/>
					<div className="flex-1">
						<div className="flex items-center gap-2 flex-wrap">
							<h2 className="text-h1 font-display font-bold text-foreground">
								{animalData.name ?? t("unknownAnimalName")}
							</h2>
							<Badge variant={getHealthStatusVariant(animalData.status ?? "")}>
								{getLocalizedStatus(animalData.status)}
							</Badge>
						</div>
						<p className="text-small text-muted-foreground">
							{getBreedDisplayName(
								animalData.breed,
								i18n.language.slice(0, 2),
							) || t("missingData")}
						</p>
					</div>
				</div>

				{/* Animal details grid */}
				<div className="grid grid-cols-2 gap-4 text-sm">
					<div>
						<p className="text-muted-foreground text-caption uppercase tracking-wide mb-1">
							{t("AgeTitle")}
						</p>
						<p className="font-semibold text-foreground">
							{animalData.birthDate
								? calculateAgeFloor(animalData.birthDate, t)
								: t("missingData")}
						</p>
					</div>
					<div>
						<p className="text-muted-foreground text-caption uppercase tracking-wide mb-1">
							{t("WeightTitle")}
						</p>
						<p className="font-semibold text-foreground">
							{animalData.lastMeasurement
								? `${animalData.lastMeasurement.value} ${animalData.lastMeasurement.unit}`
								: t("notAvailable")}
						</p>
					</div>
					<div>
						<p className="text-muted-foreground text-caption uppercase tracking-wide mb-1">
							{t("ReproductiveStatusTitle")}
						</p>
						<p className="font-semibold text-foreground">
							{getLocalizedReproductiveStatus(animalData.reproductiveStatus)}
						</p>
					</div>
					<div>
						<p className="text-muted-foreground text-caption uppercase tracking-wide mb-1">
							{t("TagNumberTitle")}
						</p>
						<p className="font-semibold text-foreground font-mono">
							{animalData.tagNumber || t("notAvailable")}
						</p>
					</div>
				</div>
			</CardContent>
		</Card>
	);
};
