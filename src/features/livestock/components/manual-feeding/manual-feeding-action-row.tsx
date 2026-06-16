import { Button } from "@/components/ui/button";

interface ManualFeedingActionRowProps {
	onSaveProfile: () => void;
	onClearProfile: () => void;
	onLogFeeding: () => void;
	isSubmittingFeed: boolean;
}

export function ManualFeedingActionRow({
	onSaveProfile,
	onClearProfile,
	onLogFeeding,
	isSubmittingFeed,
}: ManualFeedingActionRowProps) {
	return (
		<div className="flex flex-col gap-2 sm:flex-row sm:items-center">
			<Button
				type="button"
				onClick={onSaveProfile}
				variant="outline"
				className="w-full sm:w-auto"
			>
				Guardar
			</Button>
			<Button
				type="button"
				onClick={onClearProfile}
				variant="outline"
				className="w-full sm:w-auto"
			>
				Limpiar
			</Button>
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
