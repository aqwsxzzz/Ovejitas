import { Button } from "@/components/ui/button";

interface ManualFeedingActionRowProps {
	onLogFeeding: () => void;
	isSubmittingFeed: boolean;
}

export function ManualFeedingActionRow({
	onLogFeeding,
	isSubmittingFeed,
}: ManualFeedingActionRowProps) {
	return (
		<div className="mt-3 flex justify-end">
			<Button
				type="button"
				variant="default"
				onClick={onLogFeeding}
				disabled={isSubmittingFeed}
				className="w-full sm:ml-auto sm:w-auto"
			>
				{isSubmittingFeed ? "Registrando..." : "Registrar alimentacion"}
			</Button>
		</div>
	);
}
