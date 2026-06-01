interface ManualFeedingStatsProps {
	selectedMaterialName: string | null;
	selectedMaterialOnHand: number | null;
	unit: string;
	totalForSelectedMaterialAndUnit: number;
	lastFeedAtIso: string | null;
}

export function ManualFeedingStats({
	selectedMaterialName,
	selectedMaterialOnHand,
	unit,
	totalForSelectedMaterialAndUnit,
	lastFeedAtIso,
}: ManualFeedingStatsProps) {
	return (
		<div className="mt-3 grid gap-2 md:grid-cols-2">
			<div className="rounded-lg border border-(--v2-border) bg-white px-3 py-2 text-sm">
				<p className="text-xs uppercase tracking-[0.08em] text-(--v2-ink-soft)">
					Stock actual del material
				</p>
				<p className="mt-1 font-semibold">
					{selectedMaterialName
						? `${selectedMaterialName}: ${
								selectedMaterialOnHand != null
									? selectedMaterialOnHand.toFixed(2)
									: "Sin dato"
							} ${unit}`
						: "Selecciona un material"}
				</p>
			</div>
			<div className="rounded-lg border border-(--v2-border) bg-white px-3 py-2 text-sm">
				<p className="text-xs uppercase tracking-[0.08em] text-(--v2-ink-soft)">
					Consumo hoy (material/unidad seleccionados)
				</p>
				<p className="mt-1 font-semibold">
					{totalForSelectedMaterialAndUnit.toFixed(2)} {unit}
				</p>
				{lastFeedAtIso ? (
					<p className="mt-1 text-xs text-(--v2-ink-soft)">
						Ultimo registro rapido:{" "}
						{new Date(lastFeedAtIso).toLocaleString("es-EC")}
					</p>
				) : null}
			</div>
		</div>
	);
}
