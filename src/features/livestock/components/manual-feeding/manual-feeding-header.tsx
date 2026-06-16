import { ChevronDown, ChevronUp } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ManualFeedingHeaderProps {
	todayFeedCount: number;
	isExpanded: boolean;
	onToggle: () => void;
}

export function ManualFeedingHeader({
	todayFeedCount,
	isExpanded,
	onToggle,
}: ManualFeedingHeaderProps) {
	return (
		<div className="flex items-start justify-between gap-3">
			<div className="flex flex-col gap-2">
				<p className="v2-kicker">Alimentacion manual</p>
				<p className="text-sm text-(--v2-ink-soft)">
					Programa la alimentacion diaria y registrala facilmente.
				</p>
			</div>
			<div className="flex items-center gap-2">
				{todayFeedCount > 0 ? (
					<Badge variant="warning">{todayFeedCount} registro(s) hoy</Badge>
				) : null}
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={onToggle}
					aria-expanded={isExpanded}
				>
					{isExpanded ? "Ocultar" : "Registrar alimentacion"}
					{isExpanded ? (
						<ChevronUp className="ml-1 h-4 w-4" />
					) : (
						<ChevronDown className="ml-1 h-4 w-4" />
					)}
				</Button>
			</div>
		</div>
	);
}
