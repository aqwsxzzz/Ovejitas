import { useState } from "react";
import type { ComponentProps } from "react";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	useCreateMaterialConsumptionByFarmId,
	useCreateMaterialPurchaseByFarmId,
	useCreateMaterialSaleByAssetId,
} from "@/features/livestock/api/livestock-queries";

import { getMaterialActionErrorMessage } from "./material-action-utils";
import { MaterialConsumptionForm } from "./material-consumption-form";
import { MaterialPurchaseForm } from "./material-purchase-form";
import { MaterialSaleForm } from "./material-sale-form";

interface MaterialMovementDialogProps {
	farmId: string;
	materialAssetId: number;
	consumerAssets: Array<{ id: number; name: string }>;
	categoryOptions: Array<{ id: number; name: string }>;
}

type Step = "choose" | "increase" | "decrease" | "consumption" | "sale";

const TITLES: Record<Step, string> = {
	choose: "Registrar movimiento",
	increase: "Aumento de stock",
	decrease: "Reduccion de stock",
	consumption: "Registrar consumo",
	sale: "Registrar venta",
};

function BackButton({ onClick }: { onClick: () => void }) {
	return (
		<Button
			type="button"
			variant="ghost"
			size="sm"
			onClick={onClick}
		>
			<ArrowLeft className="mr-1 h-4 w-4" />
			Volver
		</Button>
	);
}

export function MaterialMovementDialog({
	farmId,
	materialAssetId,
	consumerAssets,
	categoryOptions,
}: MaterialMovementDialogProps) {
	const [open, setOpen] = useState(false);
	const [step, setStep] = useState<Step>("choose");
	const [error, setError] = useState<string | null>(null);

	const purchaseMutation = useCreateMaterialPurchaseByFarmId();
	const consumptionMutation = useCreateMaterialConsumptionByFarmId();
	const saleMutation = useCreateMaterialSaleByAssetId();

	const handleOpenChange = (next: boolean) => {
		setOpen(next);
		if (!next) {
			setStep("choose");
			setError(null);
		}
	};

	const goTo = (next: Step) => {
		setError(null);
		setStep(next);
	};

	const submit = async (run: () => Promise<unknown>, fallback: string) => {
		setError(null);
		try {
			await run();
			handleOpenChange(false);
		} catch (caught) {
			setError(getMaterialActionErrorMessage(caught, fallback));
		}
	};

	const handlePurchase: ComponentProps<
		typeof MaterialPurchaseForm
	>["onSubmit"] = (payload) =>
		submit(
			() => purchaseMutation.mutateAsync({ farmId, data: payload }),
			"No se pudo registrar la compra.",
		);

	const handleConsumption: ComponentProps<
		typeof MaterialConsumptionForm
	>["onSubmit"] = (payload) =>
		submit(
			() => consumptionMutation.mutateAsync({ farmId, data: payload }),
			"No se pudo registrar el consumo.",
		);

	const handleSale: ComponentProps<typeof MaterialSaleForm>["onSubmit"] = (
		payload,
	) =>
		submit(
			() =>
				saleMutation.mutateAsync({
					farmId,
					assetId: String(materialAssetId),
					data: payload,
				}),
			"No se pudo registrar la venta.",
		);

	return (
		<Dialog
			open={open}
			onOpenChange={handleOpenChange}
		>
			<DialogTrigger asChild>
				<Button type="button">Registrar movimiento</Button>
			</DialogTrigger>
			<DialogContent className="w-[calc(100vw-2rem)] max-w-128 p-4 sm:p-6">
				<DialogHeader>
					<DialogTitle>{TITLES[step]}</DialogTitle>
					<DialogDescription>
						Registra un cambio en el inventario de este material.
					</DialogDescription>
				</DialogHeader>

				{step === "choose" ? (
					<div className="grid gap-2">
						<Button
							variant="outline"
							onClick={() => goTo("increase")}
						>
							Aumento de stock
						</Button>
						<Button
							variant="outline"
							onClick={() => goTo("decrease")}
						>
							Reduccion de stock
						</Button>
					</div>
				) : null}

				{step === "decrease" ? (
					<div className="grid gap-2">
						<Button
							variant="outline"
							onClick={() => goTo("consumption")}
						>
							Consumo
						</Button>
						<Button
							variant="outline"
							onClick={() => goTo("sale")}
						>
							Venta
						</Button>
						<BackButton onClick={() => goTo("choose")} />
					</div>
				) : null}

				{step === "increase" ? (
					<div className="space-y-3">
						<MaterialPurchaseForm
							farmId={farmId}
							materialAssetId={materialAssetId}
							isSubmitting={purchaseMutation.isPending}
							errorMessage={error}
							onSubmit={handlePurchase}
						/>
						<BackButton onClick={() => goTo("choose")} />
					</div>
				) : null}

				{step === "consumption" ? (
					<div className="space-y-3">
						<MaterialConsumptionForm
							farmId={farmId}
							materialAssetId={materialAssetId}
							consumerAssets={consumerAssets}
							isSubmitting={consumptionMutation.isPending}
							errorMessage={error}
							onSubmit={handleConsumption}
						/>
						<BackButton onClick={() => goTo("decrease")} />
					</div>
				) : null}

				{step === "sale" ? (
					<div className="space-y-3">
						<MaterialSaleForm
							farmId={farmId}
							categoryOptions={categoryOptions}
							isSubmitting={saleMutation.isPending}
							errorMessage={error}
							onSubmit={handleSale}
						/>
						<BackButton onClick={() => goTo("decrease")} />
					</div>
				) : null}
			</DialogContent>
		</Dialog>
	);
}
