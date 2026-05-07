import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useGetFlocksPage } from "@/features/flock/api/flock-queries";
import { useGetFarmById } from "@/features/farm/api/farm-queries";
import { useGetFlockProfitabilityReport } from "@/features/flock-profitability/api/flock-profitability-queries";
import type {
	IProfitabilityFlockRow,
	ProfitabilityPeriod,
} from "@/features/flock-profitability/types/flock-profitability-types";
import { ApiRequestError } from "@/lib/axios/axios-helper";

interface FlockProfitabilityPanelProps {
	farmId: string;
}

const PERIOD_OPTIONS: ProfitabilityPeriod[] = ["daily", "weekly", "monthly"];

const getDateOffsetIso = (daysOffset: number) => {
	const date = new Date();
	date.setDate(date.getDate() + daysOffset);
	return date.toISOString().slice(0, 10);
};

const toDisplayNumber = (value: number | null | undefined, decimals = 2) => {
	if (value == null || Number.isNaN(value)) {
		return "-";
	}

	return value.toFixed(decimals);
};

const toDisplayPercent = (value: number | null | undefined) => {
	if (value == null || Number.isNaN(value)) {
		return "-";
	}

	return `${value.toFixed(2)}%`;
};

const sumBy = (
	rows: IProfitabilityFlockRow[],
	key: keyof IProfitabilityFlockRow,
) =>
	rows.reduce((acc, row) => {
		const value = row[key];
		if (typeof value === "number" && Number.isFinite(value)) {
			return acc + value;
		}
		return acc;
	}, 0);

export const FlockProfitabilityPanel = ({
	farmId,
}: FlockProfitabilityPanelProps) => {
	const { t } = useTranslation("inventory");
	const [period, setPeriod] = useState<ProfitabilityPeriod>("weekly");
	const [from, setFrom] = useState<string>(getDateOffsetIso(-30));
	const [to, setTo] = useState<string>(getDateOffsetIso(0));
	const [flockId, setFlockId] = useState<string>("all");

	const { data: farmData } = useGetFarmById(farmId);
	const { data: flockPage } = useGetFlocksPage({ farmId, page: 1, limit: 100 });
	const selectedFlockId = flockId === "all" ? undefined : flockId;

	const {
		data: report,
		isPending,
		isError,
		error,
	} = useGetFlockProfitabilityReport({
		period,
		from,
		to,
		flockId: selectedFlockId,
	});

	const flocks = flockPage?.items ?? [];
	const rows = report?.flocks ?? [];
	const currencyCode = report?.currency ?? farmData?.currency ?? "USD";

	const moneyFormatter = useMemo(
		() =>
			new Intl.NumberFormat(undefined, {
				style: "currency",
				currency: currencyCode,
				maximumFractionDigits: 2,
			}),
		[currencyCode],
	);

	const summary = useMemo(() => {
		const totalRevenue = sumBy(rows, "totalEggRevenue");
		const totalFeedCost = sumBy(rows, "totalFeedCost");
		const totalProfit = sumBy(rows, "profit");
		const eggsSellable = sumBy(rows, "eggsSellable");
		const warnings = rows.flatMap((row) => row.warnings);

		const margin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : null;
		const costPerDozen =
			eggsSellable > 0 ? (totalFeedCost / eggsSellable) * 12 : null;

		return {
			totalRevenue,
			totalFeedCost,
			totalProfit,
			margin,
			costPerDozen,
			warnings,
		};
	}, [rows]);

	const apiError = error instanceof ApiRequestError ? error : null;
	const isPricingMissingError =
		apiError?.statusCode === 422 &&
		(apiError.message.toLowerCase().includes("pricing") ||
			apiError.message.toLowerCase().includes("egg"));

	return (
		<div className="space-y-4">
			<Card>
				<CardHeader>
					<CardTitle>{t("profitability.title")}</CardTitle>
				</CardHeader>
				<CardContent className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
					<div>
						<Label>{t("profitability.period")}</Label>
						<Select
							value={period}
							onValueChange={(value) => setPeriod(value as ProfitabilityPeriod)}
						>
							<SelectTrigger className="w-full">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{PERIOD_OPTIONS.map((option) => (
									<SelectItem
										key={option}
										value={option}
									>
										{option}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<div>
						<Label>{t("profitability.from")}</Label>
						<Input
							type="date"
							value={from}
							onChange={(event) => setFrom(event.target.value)}
						/>
					</div>
					<div>
						<Label>{t("profitability.to")}</Label>
						<Input
							type="date"
							value={to}
							onChange={(event) => setTo(event.target.value)}
						/>
					</div>
					<div>
						<Label>{t("profitability.flock")}</Label>
						<Select
							value={flockId}
							onValueChange={setFlockId}
						>
							<SelectTrigger className="w-full">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">
									{t("profitability.allFlocks")}
								</SelectItem>
								{flocks.map((flock) => (
									<SelectItem
										key={flock.id}
										value={flock.id}
									>
										{flock.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</CardContent>
			</Card>

			{isPricingMissingError ? (
				<Card className="border-warning">
					<CardHeader>
						<CardTitle className="text-base">
							{t("profitability.pricingRequired.title")}
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3">
						<p className="text-sm text-muted-foreground">
							{t("profitability.pricingRequired.description")}
						</p>
						<Button
							asChild
							variant="outline"
						>
							<Link to="/v2/inventory">
								{t("profitability.pricingRequired.cta")}
							</Link>
						</Button>
					</CardContent>
				</Card>
			) : null}

			<Card>
				<CardHeader>
					<CardTitle>{t("profitability.summaryTitle")}</CardTitle>
				</CardHeader>
				<CardContent>
					{isPending ? (
						<p className="text-sm text-muted-foreground">
							{t("profitability.loading")}
						</p>
					) : isError ? (
						<p className="text-sm text-destructive">
							{apiError?.message ?? t("profitability.loading")}
						</p>
					) : rows.length === 0 ? (
						<p className="text-sm text-muted-foreground">
							{t("profitability.empty")}
						</p>
					) : (
						<div className="space-y-4">
							<div className="grid grid-cols-2 md:grid-cols-5 gap-3">
								<div className="rounded-md border p-3">
									<p className="text-xs text-muted-foreground">
										{t("profitability.revenue")}
									</p>
									<p className="text-sm font-semibold">
										{moneyFormatter.format(summary.totalRevenue)}
									</p>
								</div>
								<div className="rounded-md border p-3">
									<p className="text-xs text-muted-foreground">
										{t("profitability.feedCost")}
									</p>
									<p className="text-sm font-semibold">
										{moneyFormatter.format(summary.totalFeedCost)}
									</p>
								</div>
								<div className="rounded-md border p-3">
									<p className="text-xs text-muted-foreground">
										{t("profitability.profit")}
									</p>
									<p className="text-sm font-semibold">
										{moneyFormatter.format(summary.totalProfit)}
									</p>
								</div>
								<div className="rounded-md border p-3">
									<p className="text-xs text-muted-foreground">
										{t("profitability.margin")}
									</p>
									<p className="text-sm font-semibold">
										{toDisplayPercent(summary.margin)}
									</p>
								</div>
								<div className="rounded-md border p-3">
									<p className="text-xs text-muted-foreground">
										{t("profitability.costPerDozen")}
									</p>
									<p className="text-sm font-semibold">
										{summary.costPerDozen == null
											? "-"
											: moneyFormatter.format(summary.costPerDozen)}
									</p>
								</div>
							</div>

							{summary.warnings.length > 0 ? (
								<div className="flex flex-wrap gap-2">
									{summary.warnings.map((warning, index) => (
										<Badge
											key={`${warning}-${index}`}
											variant="warning"
										>
											{warning}
										</Badge>
									))}
								</div>
							) : null}
						</div>
					)}
				</CardContent>
			</Card>

			{!isPending && !isError && rows.length > 0 ? (
				<div className="space-y-3">
					{rows.map((row) => (
						<Card key={row.flockId}>
							<CardHeader>
								<div className="flex items-center justify-between gap-2">
									<CardTitle className="text-base">{row.flockName}</CardTitle>
									<Badge variant="outline">
										{toDisplayPercent(row.profitMargin)}
									</Badge>
								</div>
							</CardHeader>
							<CardContent className="space-y-3">
								<div className="grid grid-cols-2 md:grid-cols-4 gap-2">
									<div className="rounded-md border p-2">
										<p className="text-xs text-muted-foreground">
											{t("profitability.eggRevenue")}
										</p>
										<p className="text-sm font-medium">
											{moneyFormatter.format(row.totalEggRevenue)}
										</p>
									</div>
									<div className="rounded-md border p-2">
										<p className="text-xs text-muted-foreground">
											{t("profitability.feedCost")}
										</p>
										<p className="text-sm font-medium">
											{moneyFormatter.format(row.totalFeedCost)}
										</p>
									</div>
									<div className="rounded-md border p-2">
										<p className="text-xs text-muted-foreground">
											{t("profitability.profit")}
										</p>
										<p className="text-sm font-medium">
											{moneyFormatter.format(row.profit)}
										</p>
									</div>
									<div className="rounded-md border p-2">
										<p className="text-xs text-muted-foreground">
											{t("profitability.fcrLabel")}
										</p>
										<p className="text-sm font-medium">
											{toDisplayNumber(row.fcrKgPerDozen, 3)}
										</p>
									</div>
								</div>

								{row.warnings.length > 0 ? (
									<div className="flex flex-wrap gap-2">
										{row.warnings.map((warning, index) => (
											<Badge
												key={`${row.flockId}-${index}`}
												variant="warning"
											>
												{warning}
											</Badge>
										))}
									</div>
								) : null}

								<div className="rounded-md border overflow-hidden">
									<div className="grid grid-cols-4 gap-2 bg-muted/40 px-3 py-2 text-xs font-medium">
										<span>{t("profitability.breakdownPeriod")}</span>
										<span>{t("profitability.revenue")}</span>
										<span>{t("profitability.feedCost")}</span>
										<span>{t("profitability.profit")}</span>
									</div>
									<div className="divide-y">
										{row.periodBreakdown.map((breakdown) => (
											<div
												key={breakdown.period}
												className="grid grid-cols-4 gap-2 px-3 py-2 text-xs"
											>
												<span>{breakdown.period}</span>
												<span>
													{moneyFormatter.format(breakdown.eggRevenue)}
												</span>
												<span>{moneyFormatter.format(breakdown.feedCost)}</span>
												<span>{moneyFormatter.format(breakdown.profit)}</span>
											</div>
										))}
									</div>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			) : null}
		</div>
	);
};
