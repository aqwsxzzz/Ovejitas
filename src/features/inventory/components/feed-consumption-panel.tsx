import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
	feedConsumptionReasons,
	type FeedConsumptionReason,
} from "@/features/feed-consumption/types/feed-consumption-types";
import {
	useCreateFeedConsumption,
	useDeleteFeedConsumptionById,
	useGetInfiniteFeedConsumptions,
} from "@/features/feed-consumption/api/feed-consumption-queries";
import { useGetFeedTypes } from "@/features/feed-type/api/feed-type-queries";
import { useGetFlocksPage } from "@/features/flock/api/flock-queries";
import { useTranslation } from "react-i18next";

interface FeedConsumptionPanelProps {
	farmId: string;
}

export const FeedConsumptionPanel = ({ farmId }: FeedConsumptionPanelProps) => {
	const { t } = useTranslation("inventory");
	const [open, setOpen] = useState(false);
	const [feedTypeId, setFeedTypeId] = useState<string>("");
	const [flockId, setFlockId] = useState<string>("none");
	const [consumedAt, setConsumedAt] = useState<string>("");
	const [qty, setQty] = useState<string>("");
	const [reason, setReason] = useState<FeedConsumptionReason>("feeding");
	const [notes, setNotes] = useState<string>("");
	const [deleteConsumptionId, setDeleteConsumptionId] = useState<string | null>(
		null,
	);
	const loadMoreRef = useRef<HTMLDivElement | null>(null);
	const scrollContainerRef = useRef<HTMLDivElement | null>(null);
	const filters = useMemo(() => ({ include: "lots" as const }), []);
	const { data: feedTypes = [] } = useGetFeedTypes({ farmId });
	const { data: flockData } = useGetFlocksPage({ farmId, page: 1, limit: 100 });
	const flocks = flockData?.items ?? [];
	const hasFeedTypes = feedTypes.length > 0;
	const { data, isPending, hasNextPage, fetchNextPage, isFetchingNextPage } =
		useGetInfiniteFeedConsumptions({
			farmId,
			filters,
			limit: 5,
		});
	const consumptions = data?.items ?? [];

	useEffect(() => {
		const target = loadMoreRef.current;
		const root = scrollContainerRef.current;
		if (!target || !hasNextPage) {
			return;
		}

		const observer = new IntersectionObserver(
			(entries) => {
				const entry = entries[0];
				if (!entry?.isIntersecting || isFetchingNextPage) {
					return;
				}

				void fetchNextPage();
			},
			{ root, rootMargin: "200px" },
		);

		observer.observe(target);

		return () => {
			observer.disconnect();
		};
	}, [fetchNextPage, hasNextPage, isFetchingNextPage, consumptions.length]);
	const { mutateAsync: createConsumption, isPending: isCreating } =
		useCreateFeedConsumption();
	const { mutateAsync: deleteConsumption, isPending: isDeleting } =
		useDeleteFeedConsumptionById();

	const handleCreate = async () => {
		if (!feedTypeId || !qty || !consumedAt) {
			return;
		}

		if (reason === "feeding" && flockId === "none") {
			return;
		}

		await createConsumption({
			farmId,
			payload: {
				feedTypeId,
				flockId: flockId === "none" ? null : flockId,
				consumedAt,
				qty: Number(qty),
				reason,
				notes: notes.trim() || undefined,
			},
		});
		setFeedTypeId("");
		setFlockId("none");
		setConsumedAt("");
		setQty("");
		setReason("feeding");
		setNotes("");
		setOpen(false);
	};

	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between">
				<CardTitle>{t("feedLog.title")}</CardTitle>
				<Dialog
					open={open}
					onOpenChange={setOpen}
				>
					<DialogTrigger asChild>
						<Button
							size="sm"
							disabled={!hasFeedTypes}
						>
							{t("feedLog.newButton")}
						</Button>
					</DialogTrigger>
					<DialogContent className="max-h-[90vh] overflow-y-auto">
						<DialogTitle>{t("feedLog.modal.title")}</DialogTitle>
						<DialogDescription>
							{t("feedLog.modal.description")}
						</DialogDescription>
						<div className="space-y-3">
							<Label>{t("feedLog.modal.feedType")}</Label>
							<Select
								value={feedTypeId}
								onValueChange={setFeedTypeId}
							>
								<SelectTrigger className="w-full">
									<SelectValue
										placeholder={t("feedLog.modal.feedTypePlaceholder")}
									/>
								</SelectTrigger>
								<SelectContent>
									{feedTypes.map((item) => (
										<SelectItem
											key={item.id}
											value={item.id}
										>
											{item.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<Label>{t("feedLog.modal.reason")}</Label>
							<Select
								value={reason}
								onValueChange={(value: FeedConsumptionReason) =>
									setReason(value)
								}
							>
								<SelectTrigger className="w-full">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{feedConsumptionReasons.map((item) => (
										<SelectItem
											key={item}
											value={item}
										>
											{t(`feedLog.reasonOptions.${item}`)}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<Label>{t("feedLog.modal.flock")}</Label>
							<Select
								value={flockId}
								onValueChange={setFlockId}
							>
								<SelectTrigger className="w-full">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="none">
										{t("feedLog.modal.noFlock")}
									</SelectItem>
									{flocks.map((item) => (
										<SelectItem
											key={item.id}
											value={item.id}
										>
											{item.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
								<div>
									<Label>{t("feedLog.modal.quantity")}</Label>
									<Input
										type="number"
										min="0"
										step="0.01"
										value={qty}
										onChange={(event) => setQty(event.target.value)}
									/>
								</div>
								<div>
									<Label>{t("feedLog.modal.date")}</Label>
									<Input
										type="date"
										value={consumedAt}
										onChange={(event) => setConsumedAt(event.target.value)}
									/>
								</div>
							</div>
							<div>
								<Label>{t("feedLog.modal.notes")}</Label>
								<Textarea
									value={notes}
									onChange={(event) => setNotes(event.target.value)}
								/>
							</div>
							<Button
								className="w-full"
								disabled={isCreating}
								onClick={() => void handleCreate()}
							>
								{t("feedLog.modal.create")}
							</Button>
						</div>
					</DialogContent>
				</Dialog>
			</CardHeader>
			<CardContent>
				{!hasFeedTypes ? (
					<div className="mb-3 rounded-md border border-dashed p-3 text-sm text-muted-foreground">
						{t("feedLog.adminManagedNotice")}
					</div>
				) : null}
				{isPending ? (
					<p className="text-sm text-muted-foreground">
						{t("feedLog.loading")}
					</p>
				) : consumptions.length === 0 ? (
					<p className="text-sm text-muted-foreground">{t("feedLog.empty")}</p>
				) : (
					<div
						ref={scrollContainerRef}
						className="h-72 overflow-y-auto overscroll-contain pr-1 space-y-2"
					>
						{consumptions.map((item) => (
							<div
								key={item.id}
								className="rounded-md border p-3 flex items-center justify-between gap-3"
							>
								<div className="text-sm min-w-0">
									<p className="font-medium">
										{t("feedLog.itemTitle", {
											qty: item.qty,
											reason: t(`feedLog.reasonOptions.${item.reason}`),
										})}
									</p>
									<p className="text-muted-foreground">
										{t("feedLog.itemSubtitle", {
											date: item.consumedAt,
											cost: item.totalCost.toFixed(2),
										})}
									</p>
									<div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-xs text-muted-foreground">
										<span>
											{item.flockId
												? (flocks.find((f) => f.id === item.flockId)?.name ??
													item.flockId)
												: t("feedLog.modal.noFlock")}
										</span>
										<span>
											{feedTypes.find((f) => f.id === item.feedTypeId)?.name ??
												item.feedTypeId}
										</span>
									</div>
								</div>
								<Dialog
									open={deleteConsumptionId === item.id}
									onOpenChange={(open) =>
										setDeleteConsumptionId(open ? item.id : null)
									}
								>
									<DialogTrigger asChild>
										<Button
											variant="outline"
											size="sm"
											disabled={isDeleting}
										>
											{t("feedLog.delete")}
										</Button>
									</DialogTrigger>
									<DialogContent className="max-w-sm">
										<DialogTitle>{t("feedLog.deleteDialog.title")}</DialogTitle>
										<DialogDescription>
											{t("feedLog.deleteDialog.description")}
										</DialogDescription>
										<div className="flex justify-end gap-2">
											<Button
												variant="outline"
												onClick={() => setDeleteConsumptionId(null)}
												disabled={isDeleting}
											>
												{t("feedLog.deleteDialog.cancel")}
											</Button>
											<Button
												variant="destructive"
												disabled={isDeleting}
												onClick={() =>
													void deleteConsumption({
														farmId,
														feedConsumptionId: item.id,
													}).then(() => {
														setDeleteConsumptionId(null);
													})
												}
											>
												{t("feedLog.deleteDialog.confirm")}
											</Button>
										</div>
									</DialogContent>
								</Dialog>
							</div>
						))}
						{hasNextPage ? (
							<div
								ref={loadMoreRef}
								className="h-2"
							/>
						) : null}
						{isFetchingNextPage ? (
							<p className="text-sm text-muted-foreground">
								{t("feedLog.loadingMore")}
							</p>
						) : null}
					</div>
				)}
			</CardContent>
		</Card>
	);
};
