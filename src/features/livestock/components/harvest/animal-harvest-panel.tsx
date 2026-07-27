import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/common/section-card";
import { HarvestForm } from "./harvest-form";
import { useHarvest } from "./use-harvest";

interface AnimalHarvestPanelProps {
	farmId: string;
	producerAssetId: number;
	defaultProduceAssetId?: number | null;
}

export function AnimalHarvestPanel({
	farmId,
	producerAssetId,
	defaultProduceAssetId,
}: AnimalHarvestPanelProps) {
	const [isExpanded, setIsExpanded] = useState(false);
	const harvest = useHarvest({
		farmId,
		producerAssetId,
		enabled: isExpanded,
	});

	return (
		<SectionCard
			title="Recolección de producción"
			description="Registra lo que produjo este activo y súmalo a su canasta."
			action={
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={() => setIsExpanded((current) => !current)}
					aria-expanded={isExpanded}
				>
					{isExpanded ? "Ocultar" : "Registrar recolección"}
					{isExpanded ? (
						<ChevronUp className="ml-1 h-4 w-4" />
					) : (
						<ChevronDown className="ml-1 h-4 w-4" />
					)}
				</Button>
			}
		>
			{isExpanded ? (
				<HarvestForm
					produceAssets={harvest.produceAssets}
					categories={harvest.categories}
					defaultProduceAssetId={defaultProduceAssetId}
					isSubmitting={harvest.isSubmitting}
					errorMessage={harvest.error}
					onSubmit={harvest.submit}
					onCreateCategory={harvest.createCategory}
					onSuccess={() => setIsExpanded(false)}
				/>
			) : null}
		</SectionCard>
	);
}
