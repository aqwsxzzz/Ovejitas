import { Button } from "@/components/ui/button";

interface ManualFeedingConfirmationProps {
	isVisible: boolean;
	message: string | null;
	isSubmittingFeed: boolean;
	onConfirm: () => void;
	onCancel: () => void;
}

export function ManualFeedingConfirmation({
	isVisible,
	message,
	isSubmittingFeed,
	onConfirm,
	onCancel,
}: ManualFeedingConfirmationProps) {
	if (!isVisible) return null;

	return (
		<div className="mt-3 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900">
			<p className="font-semibold">Confirmacion requerida</p>
			<p className="mt-1">
				{message ??
					"Se alcanzo un limite de aviso para este material. Si deseas continuar, confirma el registro."}
			</p>
			<div className="mt-2 flex items-center gap-2">
				<Button
					type="button"
					variant="create"
					onClick={onConfirm}
					size="sm"
					disabled={isSubmittingFeed}
				>
					Confirmar registro extra
				</Button>
				<Button
					type="button"
					variant="ghost"
					size="sm"
					onClick={onCancel}
				>
					Cancelar
				</Button>
			</div>
		</div>
	);
}
