import { DeleteEggCollectionDialog } from "@/features/flock/components/delete-egg-collection-dialog";
import { RecordEggCollectionModal } from "@/features/flock/components/record-egg-collection-modal";
import type {
	IEggCollection,
	IFlockEvent,
} from "@/features/flock/types/flock-types";
import { useTranslation } from "react-i18next";

interface EggCollectionsListProps {
	eggCollections: IEggCollection[];
	flockId: string;
	farmId: string;
	flockInitialCount: number;
	flockEventsForHistory: IFlockEvent[];
}

const getEventDelta = (event: IFlockEvent): number => {
	switch (event.eventType) {
		case "addition":
			return event.count;
		case "mortality":
		case "sale":
		case "cull":
		case "transfer":
			return -event.count;
		default:
			return 0;
	}
};

const getFlockCountAtDate = ({
	initialCount,
	events,
	date,
}: {
	initialCount: number;
	events: IFlockEvent[];
	date: string;
}): number => {
	const normalizedTargetDate = date.slice(0, 10);

	const delta = events.reduce((sum, event) => {
		if (event.date.slice(0, 10) > normalizedTargetDate) {
			return sum;
		}

		return sum + getEventDelta(event);
	}, 0);

	return Math.max(0, initialCount + delta);
};

export const EggCollectionsList = ({
	eggCollections,
	flockId,
	farmId,
	flockInitialCount,
	flockEventsForHistory,
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
			{eggCollections.map((eggCollection) => {
				const flockCountAtCollection = getFlockCountAtDate({
					initialCount: flockInitialCount,
					events: flockEventsForHistory,
					date: eggCollection.date,
				});
				const stableLayRate =
					flockCountAtCollection > 0
						? (eggCollection.totalEggs / flockCountAtCollection) * 100
						: 0;

				return (
					<div
						key={eggCollection.id}
						className="rounded-card border p-3"
					>
						<div className="flex items-center justify-between gap-2">
							<p className="font-medium">{eggCollection.date}</p>
							<div className="flex items-center gap-1">
								<p className="text-sm text-muted-foreground">
									{t("detail.eggCollections.layRate", {
										layRate: stableLayRate.toFixed(2),
									})}
								</p>
								<RecordEggCollectionModal
									mode="edit"
									flockId={flockId}
									farmId={farmId}
									collection={eggCollection}
								/>
								<DeleteEggCollectionDialog
									flockId={flockId}
									farmId={farmId}
									collectionId={eggCollection.id}
								/>
							</div>
						</div>
						<p className="text-sm">
							{t("detail.eggCollections.totals", {
								totalEggs: eggCollection.totalEggs,
								usableEggs: eggCollection.usableEggs,
								brokenEggs: eggCollection.brokenEggs,
							})}
						</p>
					</div>
				);
			})}
		</div>
	);
};
