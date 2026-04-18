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
					className="rounded-card border px-3 py-2"
				>
					<div className="flex items-start justify-between gap-3">
						<div className="min-w-0 space-y-1">
							<p className="text-sm font-semibold leading-tight">
								{t(`eventType.${event.eventType}`)}
							</p>
							<p className="text-xs text-muted-foreground leading-tight">
								{t("detail.events.count", { count: event.count })}
							</p>
						</div>
						<p className="shrink-0 text-xs text-muted-foreground leading-tight">
							{event.date}
						</p>
					</div>
					{event.reason && (
						<p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
							{event.reason}
						</p>
					)}
				</div>
			))}
		</div>
	);
};
