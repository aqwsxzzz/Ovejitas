import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { IAssetProductionTargetRead } from "@/features/livestock/types/production-targets-types";

import {
	basisLabel,
	normalizeRate,
	periodLabel,
} from "./production-targets-utils";

interface ProductionTargetRowProps {
	target: IAssetProductionTargetRead;
	productName: string;
	disabled: boolean;
	onAdjustRate: (target: IAssetProductionTargetRead, rate: string) => void;
	onArchive: (target: IAssetProductionTargetRead) => void;
}

export function ProductionTargetRow({
	target,
	productName,
	disabled,
	onAdjustRate,
	onArchive,
}: ProductionTargetRowProps) {
	const [editing, setEditing] = useState(false);
	const [rate, setRate] = useState(() => normalizeRate(target.expected_rate));

	const period = periodLabel(target.period);
	const rateLabel = `${normalizeRate(target.expected_rate)} ${basisLabel(target.basis)}${
		period ? ` / ${period}` : ""
	}`;

	const handleSave = () => {
		const trimmed = rate.trim();
		const parsed = Number(trimmed);
		if (trimmed === "" || !Number.isFinite(parsed) || parsed < 0) return;
		onAdjustRate(target, trimmed);
		setEditing(false);
	};

	return (
		<div className="flex items-center justify-between gap-2 border-b py-2 last:border-b-0">
			<div className="min-w-0">
				<p className="truncate font-medium">{productName}</p>
				<p className="text-xs text-(--v2-ink-soft)">
					{rateLabel} · desde {target.effective_from}
				</p>
			</div>
			{editing ? (
				<div className="flex items-center gap-2">
					<Input
						type="number"
						min="0"
						step="0.01"
						value={rate}
						onChange={(event) => setRate(event.target.value)}
						className="w-24"
					/>
					<Button type="button" onClick={handleSave} disabled={disabled}>
						Guardar
					</Button>
					<Button
						type="button"
						variant="ghost"
						onClick={() => setEditing(false)}
					>
						Cancelar
					</Button>
				</div>
			) : (
				<div className="flex items-center gap-2">
					<Button
						type="button"
						variant="outline"
						onClick={() => setEditing(true)}
						disabled={disabled}
					>
						Ajustar tasa
					</Button>
					<Button
						type="button"
						variant="ghost"
						onClick={() => onArchive(target)}
						disabled={disabled}
					>
						Quitar
					</Button>
				</div>
			)}
		</div>
	);
}
