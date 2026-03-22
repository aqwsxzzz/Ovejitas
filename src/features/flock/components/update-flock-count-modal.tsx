import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreateFlockEvent } from "@/features/flock/api/flock-queries";
import type { IFlock } from "@/features/flock/types/flock-types";
import { cn } from "@/lib/utils";
import { Minus, Pencil, Plus } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

interface UpdateFlockCountModalProps {
	flock: IFlock;
	farmId: string;
	buttonClassName?: string;
	editorClassName?: string;
}

const parseCountValue = (value: string): number => {
	const parsedValue = Number(value);

	if (!Number.isFinite(parsedValue)) {
		return NaN;
	}

	return Math.max(0, Math.floor(parsedValue));
};

export const UpdateFlockCountModal = ({
	flock,
	farmId,
	buttonClassName,
	editorClassName,
}: UpdateFlockCountModalProps) => {
	const { t } = useTranslation("flocks");
	const [isEditing, setIsEditing] = useState(false);
	const [countValue, setCountValue] = useState(String(flock.currentCount));
	const { mutateAsync: createFlockEvent, isPending } = useCreateFlockEvent();

	const parsedCount = parseCountValue(countValue);
	const isValueValid = Number.isFinite(parsedCount);
	const hasChanges = isValueValid && parsedCount !== flock.currentCount;
	const deltaCount = parsedCount - flock.currentCount;

	const handleStep = (delta: number) => {
		const safeCurrentValue = Number.isFinite(parsedCount) ? parsedCount : 0;
		setCountValue(String(Math.max(0, safeCurrentValue + delta)));
	};

	const handleStartEditing = () => {
		setCountValue(String(flock.currentCount));
		setIsEditing(true);
	};

	const handleSave = async () => {
		if (!hasChanges) {
			setIsEditing(false);
			return;
		}

		const response = await createFlockEvent({
			flockId: flock.id,
			farmId,
			payload: {
				eventType: deltaCount > 0 ? "addition" : "mortality",
				count: Math.abs(deltaCount),
				date: new Date().toISOString().slice(0, 10),
				reason: t("countEditor.adjustmentReason"),
			},
		});

		if (response.status === "success") {
			setIsEditing(false);
		}
	};

	return (
		<div
			className="flex flex-col gap-2"
			onClick={(event) => {
				event.preventDefault();
				event.stopPropagation();
			}}
		>
			{!isEditing ? (
				<Button
					variant="outline"
					size="sm"
					onClick={handleStartEditing}
					className={cn(buttonClassName)}
				>
					<Pencil className="h-4 w-4" />
					{t("countEditor.editAction")}
				</Button>
			) : (
				<div
					className={cn(
						"w-fit max-w-full min-w-[148px] space-y-2 rounded-card border p-2",
						editorClassName,
					)}
				>
					<div className="flex items-center justify-center gap-2">
						<Button
							variant="outline"
							size="icon"
							onClick={() => handleStep(-1)}
							disabled={isPending}
							className="h-9 w-9"
						>
							<Minus className="h-4 w-4" />
						</Button>
						<Input
							type="number"
							min={0}
							value={countValue}
							onChange={(event) => setCountValue(event.target.value)}
							disabled={isPending}
							className="h-9 w-16 min-w-0 text-center px-2"
						/>
						<Button
							variant="outline"
							size="icon"
							onClick={() => handleStep(1)}
							disabled={isPending}
							className="h-9 w-9"
						>
							<Plus className="h-4 w-4" />
						</Button>
					</div>
					<Button
						size="sm"
						onClick={() => void handleSave()}
						disabled={isPending}
						className="h-9 w-full px-3"
					>
						{hasChanges
							? isPending
								? t("countEditor.saving")
								: t("countEditor.save")
							: t("countEditor.keepValue")}
					</Button>
				</div>
			)}
		</div>
	);
};
