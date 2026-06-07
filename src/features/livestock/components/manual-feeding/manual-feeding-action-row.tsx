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
		<div className="mt-3 flex items-center gap-2 ">
			<div className="flex w-full justify-between ">
				<Button
					type="button"
					onClick={onSaveProfile}
					variant="outline"
				>
					Guardar
				</Button>
				<Button
					type="button"
					onClick={onClearProfile}
					variant="outline"
				>
					Limpiar
				</Button>
			</div>
			<Button
				type="button"
				variant="default"
				onClick={onLogFeeding}
				disabled={isSubmittingFeed}
			>
				{isSubmittingFeed ? "Registrando..." : "Registrar alimentacion"}
			</Button>
		</div>
	);
}
