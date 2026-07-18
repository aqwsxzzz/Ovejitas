import { ChevronDown, ChevronUp } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ManualFeedingToggleProps {
	todayFeedCount: number;
	isExpanded: boolean;
	onToggle: () => void;
}

export function ManualFeedingToggle({
	todayFeedCount,
	isExpanded,
	onToggle,
}: ManualFeedingToggleProps) {
	return (
		<>
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
		</>
	);
}
