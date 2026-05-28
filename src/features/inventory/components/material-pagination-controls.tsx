import { Button } from "@/components/ui/button";

interface MaterialPaginationControlsProps {
	page: number;
	hasNext: boolean;
	onPrevious: () => void;
	onNext: () => void;
}

export function MaterialPaginationControls({
	page,
	hasNext,
	onPrevious,
	onNext,
}: MaterialPaginationControlsProps) {
	return (
		<div className="mt-3 flex items-center justify-end gap-2">
			<Button
				type="button"
				variant="outline"
				size="sm"
				onClick={onPrevious}
				disabled={page <= 1}
			>
				Previous
			</Button>
			<p className="text-xs text-(--v2-ink-soft)">Page {page}</p>
			<Button
				type="button"
				variant="outline"
				size="sm"
				onClick={onNext}
				disabled={!hasNext}
			>
				Next
			</Button>
		</div>
	);
}
