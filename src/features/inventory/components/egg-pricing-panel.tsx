import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useGetFarmById } from "@/features/farm/api/farm-queries";
import {
	useCreateEggPricing,
	useGetActiveEggPricing,
	useGetEggPricingHistory,
} from "@/features/egg-pricing/api/egg-pricing-queries";

interface EggPricingPanelProps {
	farmId: string;
}

const getTodayIso = () => new Date().toISOString().slice(0, 10);

export const EggPricingPanel = ({ farmId }: EggPricingPanelProps) => {
	const { t } = useTranslation("inventory");
	const [pricePerEgg, setPricePerEgg] = useState<string>("");
	const [effectiveFrom, setEffectiveFrom] = useState<string>(getTodayIso());
	const { data: farmData } = useGetFarmById(farmId);
	const { data: activePricing, isPending: isActivePending } =
		useGetActiveEggPricing();
	const { data: pricingHistory, isPending: isHistoryPending } =
		useGetEggPricingHistory();
	const createPricingMutation = useCreateEggPricing();
	const currencyCode = farmData?.currency ?? "USD";

	const moneyFormatter = useMemo(
		() =>
			new Intl.NumberFormat(undefined, {
				style: "currency",
				currency: currencyCode,
				maximumFractionDigits: 4,
			}),
		[currencyCode],
	);

	const handleCreatePricing = async () => {
		const parsedPrice = Number(pricePerEgg);
		if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
			toast.error("Price per egg must be greater than 0.");
			return;
		}

		try {
			await createPricingMutation.mutateAsync({
				pricePerEgg: parsedPrice,
				effectiveFrom,
			});
			setPricePerEgg("");
			toast.success("Egg pricing updated.");
		} catch (error) {
			toast.error(
				error instanceof Error
					? error.message
					: "Failed to update egg pricing.",
			);
		}
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>{t("eggPricing.title")}</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
					<div>
						<Label>{t("eggPricing.pricePerEgg")}</Label>
						<Input
							type="number"
							step="0.0001"
							min="0"
							value={pricePerEgg}
							onChange={(event) => setPricePerEgg(event.target.value)}
							placeholder="0.50"
						/>
					</div>
					<div>
						<Label>{t("eggPricing.effectiveFrom")}</Label>
						<Input
							type="date"
							value={effectiveFrom}
							onChange={(event) => setEffectiveFrom(event.target.value)}
						/>
					</div>
					<div className="flex items-end">
						<Button
							type="button"
							onClick={() => void handleCreatePricing()}
							disabled={createPricingMutation.isPending}
							className="w-full"
						>
							{createPricingMutation.isPending
								? t("eggPricing.saving")
								: t("eggPricing.setPrice")}
						</Button>
					</div>
				</div>

				<div className="rounded-md border p-3 space-y-2">
					<p className="text-sm font-semibold">
						{t("eggPricing.activePriceTitle")}
					</p>
					{isActivePending ? (
						<p className="text-sm text-muted-foreground">
							{t("eggPricing.loadingActive")}
						</p>
					) : activePricing ? (
						<div className="flex items-center justify-between gap-2">
							<p className="text-sm">
								{moneyFormatter.format(activePricing.pricePerEgg)}{" "}
								{t("eggPricing.perEgg")}
							</p>
							<Badge variant="outline">
								{t("eggPricing.from")} {activePricing.effectiveFrom}
							</Badge>
						</div>
					) : (
						<p className="text-sm text-muted-foreground">
							{t("eggPricing.noActivePrice")}
						</p>
					)}
				</div>

				<div className="rounded-md border p-3 space-y-2">
					<p className="text-sm font-semibold">
						{t("eggPricing.historyTitle")}
					</p>
					{isHistoryPending ? (
						<p className="text-sm text-muted-foreground">
							{t("eggPricing.loadingHistory")}
						</p>
					) : (pricingHistory?.length ?? 0) === 0 ? (
						<p className="text-sm text-muted-foreground">
							{t("eggPricing.noHistory")}
						</p>
					) : (
						<div className="space-y-1">
							{pricingHistory?.slice(0, 5).map((row) => (
								<div
									key={row.id}
									className="text-xs text-muted-foreground flex items-center justify-between gap-3"
								>
									<span>
										{row.effectiveFrom} -{" "}
										{row.effectiveTo ?? t("eggPricing.ongoing")}
									</span>
									<span>{moneyFormatter.format(row.pricePerEgg)}</span>
								</div>
							))}
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);
};
