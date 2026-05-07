import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useGetFlocksPage } from "@/features/flock/api/flock-queries";
import { useGetFeedLots } from "@/features/feed-lot/api/feed-lot-queries";
import { useGetFeedTypes } from "@/features/feed-type/api/feed-type-queries";
import {
	useGetFeedCostByFlock,
	useGetFeedCostByLot,
} from "@/features/feed-report/api/feed-report-queries";

interface FeedReportsPanelProps {
	farmId: string;
}

export const FeedReportsPanel = ({ farmId }: FeedReportsPanelProps) => {
	const { t, i18n } = useTranslation("inventory");
	const [from, setFrom] = useState("");
	const [to, setTo] = useState("");
	const [flockId, setFlockId] = useState("all");
	const [lotId, setLotId] = useState("all");

	const { data: flockData } = useGetFlocksPage({ farmId, page: 1, limit: 100 });
	const { data: feedTypes = [] } = useGetFeedTypes({ farmId });
	const { data: lotData = [] } = useGetFeedLots({ farmId });
	const flocks = flockData?.items ?? [];
	const selectedLotId = lotId === "all" ? undefined : lotId;
	const selectedFlockId = flockId === "all" ? undefined : flockId;

	const { data: costByFlockResponse, isPending: isCostByFlockPending } =
		useGetFeedCostByFlock({
			farmId,
			filters: {
				from: from || undefined,
				to: to || undefined,
				flockId: selectedFlockId,
			},
		});

	const { data: costByLot, isPending: isCostByLotPending } =
		useGetFeedCostByLot({
			farmId,
			lotId: selectedLotId,
		});

	const money = useMemo(
		() =>
			new Intl.NumberFormat(i18n.language, {
				style: "currency",
				currency: "USD",
				maximumFractionDigits: 2,
			}),
		[i18n.language],
	);

	const getFlockName = (flockId: string | null): string => {
		if (!flockId) return t("feedReports.costByFlock.waste");
		return flocks.find((f) => f.id === flockId)?.name ?? flockId;
	};

	const getFeedTypeName = (feedTypeId: string): string => {
		return feedTypes.find((f) => f.id === feedTypeId)?.name ?? feedTypeId;
	};

	const costByFlockRows = costByFlockResponse?.flocks ?? [];

	return (
		<div className="grid grid-cols-1 gap-4">
			<Card>
				<CardHeader>
					<CardTitle>{t("feedReports.filters.title")}</CardTitle>
				</CardHeader>
				<CardContent className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
					<div>
						<Label>{t("feedReports.filters.from")}</Label>
						<Input
							type="date"
							value={from}
							onChange={(event) => setFrom(event.target.value)}
						/>
					</div>
					<div>
						<Label>{t("feedReports.filters.to")}</Label>
						<Input
							type="date"
							value={to}
							onChange={(event) => setTo(event.target.value)}
						/>
					</div>
					<div>
						<Label>{t("feedReports.filters.flock")}</Label>
						<Select
							value={flockId}
							onValueChange={setFlockId}
						>
							<SelectTrigger className="w-full">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">
									{t("feedReports.filters.all")}
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
					<div>
						<Label>{t("feedReports.filters.lot")}</Label>
						<Select
							value={lotId}
							onValueChange={setLotId}
						>
							<SelectTrigger className="w-full">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">
									{t("feedReports.filters.all")}
								</SelectItem>
								{lotData.map((lot) => (
									<SelectItem
										key={lot.id}
										value={lot.id}
									>
										{lot.id.slice(0, 8)}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>{t("feedReports.costByFlock.title")}</CardTitle>
				</CardHeader>
				<CardContent>
					{isCostByFlockPending ? (
						<p className="text-sm text-muted-foreground">
							{t("feedReports.costByFlock.loading")}
						</p>
					) : costByFlockRows.length === 0 ? (
						<p className="text-sm text-muted-foreground">
							{t("feedReports.costByFlock.empty")}
						</p>
					) : (
						<div className="space-y-3">
							{costByFlockRows.map((row) => (
								<div
									key={row.flockId ?? "waste"}
									className="rounded-md border p-3 text-sm space-y-2"
								>
									<div className="flex items-center justify-between">
										<p className="font-semibold">{getFlockName(row.flockId)}</p>
										<Badge variant="outline">
											{t("feedReports.costByFlock.totalCost", {
												value: money.format(row.totalCost),
											})}
										</Badge>
									</div>
									<p className="text-xs text-muted-foreground">
										{t("feedReports.costByFlock.totalQty", {
											value: (row.totalQty ?? 0).toFixed(2),
										})}{" "}
										kg
									</p>
									{row.byFeedType.length > 0 && (
										<div className="pl-2 space-y-1 border-l border-dashed">
											{row.byFeedType.map((feedType) => (
												<div
													key={feedType.feedTypeId}
													className="text-xs text-muted-foreground"
												>
													<p>
														{getFeedTypeName(feedType.feedTypeId)}:{" "}
														{feedType.totalQty.toFixed(2)} kg @ $
														{money
															.format(feedType.totalCost / feedType.totalQty)
															.replace(/\D/g, "")}
														/kg
													</p>
												</div>
											))}
										</div>
									)}
								</div>
							))}
						</div>
					)}
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>{t("feedReports.costByLot.title")}</CardTitle>
				</CardHeader>
				<CardContent>
					{!selectedLotId ? (
						<p className="text-sm text-muted-foreground">
							{t("feedReports.costByLot.selectLot")}
						</p>
					) : isCostByLotPending ? (
						<p className="text-sm text-muted-foreground">
							{t("feedReports.costByLot.loading")}
						</p>
					) : !costByLot ? (
						<p className="text-sm text-muted-foreground">
							{t("feedReports.costByLot.empty")}
						</p>
					) : (
						<div className="space-y-3">
							<div className="rounded-md border p-3 text-sm space-y-2">
								<div className="flex items-center justify-between">
									<p className="font-semibold">
										{getFeedTypeName(costByLot.feedTypeId)}
									</p>
									<Badge variant="outline">
										{money.format(costByLot.totalCost)}
									</Badge>
								</div>
								<div className="grid grid-cols-2 gap-2">
									<div>
										<p className="text-xs text-muted-foreground">Purchased</p>
										<p className="text-sm font-medium">
											{costByLot.qtyPurchased.toFixed(2)} kg
										</p>
									</div>
									<div>
										<p className="text-xs text-muted-foreground">Drawn</p>
										<p className="text-sm font-medium">
											{costByLot.qtyDrawn.toFixed(2)} kg
										</p>
									</div>
									<div>
										<p className="text-xs text-muted-foreground">Remaining</p>
										<p className="text-sm font-medium">
											{costByLot.qtyRemaining.toFixed(2)} kg
										</p>
									</div>
									<div>
										<p className="text-xs text-muted-foreground">Unit Cost</p>
										<p className="text-sm font-medium">
											{money.format(
												costByLot.totalCost / (costByLot.qtyDrawn || 1),
											)}
										</p>
									</div>
								</div>
							</div>

							{costByLot.byFlock.length > 0 && (
								<div className="rounded-md border p-3 text-sm space-y-2">
									<p className="font-semibold text-xs">Consumption by flock</p>
									<div className="space-y-1">
										{costByLot.byFlock.map((flock) => (
											<div
												key={flock.flockId ?? "waste"}
												className="flex justify-between text-xs text-muted-foreground"
											>
												<span>{getFlockName(flock.flockId)}</span>
												<span>
													{flock.totalQty.toFixed(2)} kg (
													{money.format(flock.totalCost)})
												</span>
											</div>
										))}
									</div>
								</div>
							)}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
};
