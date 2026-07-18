import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDefaultCurrencyId } from "@/features/currency/api/currency-queries";
import { CurrencySelectField } from "@/features/currency/components/currency-select-field";
import { useUpdateIndividual } from "@/features/livestock/api/livestock-queries";

interface IndividualLifecycleActionsProps {
	farmId: string;
	assetId: string;
	individualId: string;
}

type Mode = "none" | "sell" | "deceased";

export function IndividualLifecycleActions({
	farmId,
	assetId,
	individualId,
}: IndividualLifecycleActionsProps) {
	const [mode, setMode] = useState<Mode>("none");
	const [occurredAt, setOccurredAt] = useState(
		new Date().toISOString().slice(0, 16),
	);
	const [saleAmount, setSaleAmount] = useState("");
	const defaultCurrencyId = useDefaultCurrencyId(farmId);
	const [currencyId, setCurrencyId] = useState<number | undefined>(undefined);
	const selectedCurrencyId = currencyId ?? defaultCurrencyId;
	const [buyer, setBuyer] = useState("");
	const [cause, setCause] = useState("");
	const [error, setError] = useState<string | null>(null);

	const updateMutation = useUpdateIndividual();

	const reset = () => {
		setMode("none");
		setSaleAmount("");
		setBuyer("");
		setCause("");
		setError(null);
	};

	const handleSell = async () => {
		const amount = Number(saleAmount);
		if (!Number.isFinite(amount) || amount <= 0) {
			setError("Ingresa el monto de venta (mayor a 0).");
			return;
		}
		setError(null);
		await updateMutation.mutateAsync({
			farmId,
			assetId,
			individualId,
			data: {
				status: "sold",
				sale_amount: amount,
				currency_id: selectedCurrencyId ?? null,
				buyer: buyer.trim() || null,
				sold_at: occurredAt ? new Date(occurredAt).toISOString() : null,
			},
		});
		reset();
	};

	const handleDeceased = async () => {
		setError(null);
		await updateMutation.mutateAsync({
			farmId,
			assetId,
			individualId,
			data: {
				status: "deceased",
				cause: cause.trim() || null,
				died_at: occurredAt ? new Date(occurredAt).toISOString() : null,
			},
		});
		reset();
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Estado del animal</CardTitle>
			</CardHeader>
			<CardContent className="space-y-3">
				{mode === "none" ? (
					<div className="flex flex-wrap gap-2">
						<Button
							type="button"
							variant="outline"
							onClick={() => setMode("sell")}
						>
							Registrar venta
						</Button>
						<Button
							type="button"
							variant="outline"
							className="text-destructive hover:text-destructive"
							onClick={() => setMode("deceased")}
						>
							Registrar fallecimiento
						</Button>
					</div>
				) : (
					<div className="space-y-3">
						<div className="space-y-1.5">
							<Label htmlFor="lifecycle-occurred-at">
								{mode === "sell" ? "Fecha de venta" : "Fecha de fallecimiento"}
							</Label>
							<Input
								id="lifecycle-occurred-at"
								type="datetime-local"
								value={occurredAt}
								onChange={(event) => setOccurredAt(event.target.value)}
							/>
						</div>

						{mode === "sell" ? (
							<div className="grid gap-3 md:grid-cols-2">
								<div className="space-y-1.5">
									<Label htmlFor="lifecycle-amount">Monto de venta</Label>
									<Input
										id="lifecycle-amount"
										type="number"
										min="0"
										step="0.01"
										value={saleAmount}
										onChange={(event) => setSaleAmount(event.target.value)}
									/>
								</div>
								<div className="space-y-1.5">
									<Label htmlFor="lifecycle-buyer">Comprador (opcional)</Label>
									<Input
										id="lifecycle-buyer"
										value={buyer}
										onChange={(event) => setBuyer(event.target.value)}
									/>
								</div>
								<CurrencySelectField
									farmId={farmId}
									value={selectedCurrencyId}
									onChange={setCurrencyId}
								/>
							</div>
						) : (
							<div className="space-y-1.5">
								<Label htmlFor="lifecycle-cause">Causa (opcional)</Label>
								<Input
									id="lifecycle-cause"
									value={cause}
									onChange={(event) => setCause(event.target.value)}
								/>
							</div>
						)}

						{error ? (
							<p className="text-sm text-destructive">{error}</p>
						) : null}

						<div className="flex justify-end gap-2">
							<Button
								type="button"
								variant="outline"
								onClick={reset}
								disabled={updateMutation.isPending}
							>
								Cancelar
							</Button>
							<Button
								type="button"
								disabled={updateMutation.isPending}
								onClick={() =>
									void (mode === "sell" ? handleSell() : handleDeceased())
								}
							>
								{updateMutation.isPending ? "Guardando..." : "Confirmar"}
							</Button>
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
