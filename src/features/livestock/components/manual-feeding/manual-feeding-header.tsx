import { Badge } from "@/components/ui/badge";

interface ManualFeedingHeaderProps {
	todayFeedCount: number;
}

export function ManualFeedingHeader({
	todayFeedCount,
}: ManualFeedingHeaderProps) {
	return (
		<div className="mb-3 flex items-start justify-between gap-3">
			<div className="flex flex-col gap-2">
				<p className="v2-kicker">Alimentacion manual</p>
				<p className="text-sm text-(--v2-ink-soft)">
					Programa la alimentacion diaria y registrala facilmente.
				</p>
			</div>
			{todayFeedCount > 0 ? (
				<Badge variant="warning">{todayFeedCount} registro(s) hoy</Badge>
			) : null}
		</div>
	);
}
