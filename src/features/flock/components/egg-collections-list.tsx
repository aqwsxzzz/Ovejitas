import type { IEggCollection } from "@/features/flock/types/flock-types";
import { useTranslation } from "react-i18next";

interface EggCollectionsListProps {
	eggCollections: IEggCollection[];
}

export const EggCollectionsList = ({
	eggCollections,
}: EggCollectionsListProps) => {
	const { t } = useTranslation("flocks");

	if (eggCollections.length === 0) {
		return (
			<div className="rounded-card border p-6 text-center text-muted-foreground">
				{t("detail.eggCollections.empty")}
			</div>
		);
	}

	return (
		<div className="space-y-2">
			{eggCollections.map((eggCollection) => (
				<div
					key={eggCollection.id}
					className="rounded-card border p-3"
				>
					<div className="flex items-center justify-between gap-2">
						<p className="font-medium">{eggCollection.date}</p>
						<p className="text-sm text-muted-foreground">
							{t("detail.eggCollections.layRate", {
								layRate: eggCollection.layRate.toFixed(2),
							})}
						</p>
					</div>
					<p className="text-sm">
						{t("detail.eggCollections.totals", {
							totalEggs: eggCollection.totalEggs,
							usableEggs: eggCollection.usableEggs,
							brokenEggs: eggCollection.brokenEggs,
						})}
					</p>
				</div>
			))}
		</div>
	);
};
