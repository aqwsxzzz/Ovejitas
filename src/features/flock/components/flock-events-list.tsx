import type { IFlockEvent } from "@/features/flock/types/flock-types";
import { useTranslation } from "react-i18next";

interface FlockEventsListProps {
	events: IFlockEvent[];
}

export const FlockEventsList = ({ events }: FlockEventsListProps) => {
	const { t } = useTranslation("flocks");

	if (events.length === 0) {
		return (
			<div className="rounded-card border p-6 text-center text-muted-foreground">
				{t("detail.events.empty")}
			</div>
		);
	}

	return (
		<div className="space-y-2">
			{events.map((event) => (
				<div
					key={event.id}
					className="rounded-card border p-3"
				>
					<div className="flex items-center justify-between gap-2">
						<p className="font-medium">{t(`eventType.${event.eventType}`)}</p>
						<p className="text-sm text-muted-foreground">{event.date}</p>
					</div>
					<p className="text-sm">
						{t("detail.events.count", { count: event.count })}
					</p>
					{event.reason && (
						<p className="text-sm text-muted-foreground">{event.reason}</p>
					)}
				</div>
			))}
		</div>
	);
};
