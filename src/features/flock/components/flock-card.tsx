import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { IFlock } from "@/features/flock/types/flock-types";
import { FlockStatusBadge } from "@/features/flock/components/flock-status-badge";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "@tanstack/react-router";

interface FlockCardProps {
	flock: IFlock;
}

const getTranslationName = (
	translations: Array<{ language: string; name: string }> | undefined,
): string => {
	if (!translations || translations.length === 0) {
		return "-";
	}

	const preferredTranslation = translations.find(
		(item) => item.language === "en" || item.language === "es",
	);

	return preferredTranslation?.name ?? translations[0].name;
};

export const FlockCard = ({ flock }: FlockCardProps) => {
	const { t } = useTranslation("flocks");
	const { farmId } = useParams({ strict: false });

	const speciesName = getTranslationName(flock.species?.translations);
	const breedName = getTranslationName(flock.breed?.translations);

	return (
		<Link
			to="/farm/$farmId/flocks/$flockId"
			params={{ farmId: farmId!, flockId: flock.id }}
			className="no-underline"
		>
			<Card className="py-4 hover:border-primary/40 transition-colors">
				<CardHeader className="px-4 md:px-6 py-0">
					<div className="flex items-start justify-between gap-3">
						<div>
							<CardTitle className="text-lg">{flock.name}</CardTitle>
							<p className="text-sm text-muted-foreground">
								{t(`flockType.${flock.flockType}`)}
							</p>
						</div>
						<FlockStatusBadge status={flock.status} />
					</div>
				</CardHeader>
				<CardContent className="px-4 md:px-6 pt-3 grid grid-cols-2 gap-3 text-sm">
					<div>
						<p className="text-muted-foreground">{t("fields.currentCount")}</p>
						<p className="font-semibold">{flock.currentCount}</p>
					</div>
					<div>
						<p className="text-muted-foreground">{t("fields.initialCount")}</p>
						<p className="font-semibold">{flock.initialCount}</p>
					</div>
					<div>
						<p className="text-muted-foreground">{t("fields.species")}</p>
						<p>{speciesName}</p>
					</div>
					<div>
						<p className="text-muted-foreground">{t("fields.breed")}</p>
						<p>{breedName}</p>
					</div>
					<div>
						<p className="text-muted-foreground">{t("fields.startDate")}</p>
						<p>{flock.startDate}</p>
					</div>
					<div>
						<p className="text-muted-foreground">{t("fields.houseName")}</p>
						<p>{flock.houseName ?? t("common.notProvided")}</p>
					</div>
				</CardContent>
			</Card>
		</Link>
	);
};
