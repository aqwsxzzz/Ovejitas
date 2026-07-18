import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingState } from "@/components/common/loading-state";
import { useGetFarmCurrencies } from "@/features/currency/api/currency-queries";
import { AddCurrencyRow } from "@/features/currency/components/add-currency-row";
import { CurrencyRowItem } from "@/features/currency/components/currency-row-item";

interface CurrencyManagementSectionProps {
	farmId: string;
	disabled?: boolean;
}

/**
 * Enable/rename/archive the currencies a farm can log money in. Archived
 * currencies stay out of pickers but keep their historical events intact.
 */
export function CurrencyManagementSection({
	farmId,
	disabled,
}: CurrencyManagementSectionProps) {
	const { data: currencies, isPending } = useGetFarmCurrencies({ farmId });
	const active = (currencies ?? []).filter(
		(currency) => currency.archived_at == null,
	);

	return (
		<Card>
			<CardHeader>
				<CardTitle>Monedas</CardTitle>
			</CardHeader>
			<CardContent className="space-y-3">
				<p className="text-sm text-muted-foreground">
					Registra ingresos y gastos en varias monedas. Cada monto conserva su
					moneda original; los reportes las muestran por separado.
				</p>

				{isPending ? (
					<LoadingState message="Cargando monedas..." />
				) : active.length === 0 ? (
					<p className="text-sm text-muted-foreground">
						No hay monedas habilitadas todavía.
					</p>
				) : (
					<div className="space-y-2">
						{active.map((currency) => (
							<CurrencyRowItem
								key={currency.id}
								farmId={farmId}
								currency={currency}
								disabled={disabled}
							/>
						))}
					</div>
				)}

				<AddCurrencyRow
					farmId={farmId}
					enabledCodes={active.map((currency) => currency.code)}
					disabled={disabled}
				/>
			</CardContent>
		</Card>
	);
}
