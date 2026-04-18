import { Trash2 } from "lucide-react";
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
import { useGetFeedTypes } from "@/features/feed-type/api/feed-type-queries";
import {
	useCreateFeedLot,
	useDeleteFeedLotById,
	useGetInfiniteFeedLots,
} from "@/features/feed-lot/api/feed-lot-queries";
import { useTranslation } from "react-i18next";

interface FeedLotPanelProps {
	farmId: string;
}

export const FeedLotPanel = ({ farmId }: FeedLotPanelProps) => {
	const { t } = useTranslation("inventory");
	const [open, setOpen] = useState(false);
	const [filterFeedTypeId, setFilterFeedTypeId] = useState<string>("all");
	const [stockFilter, setStockFilter] = useState<"all" | "with_stock">(
		"with_stock",
	);
	const [feedTypeId, setFeedTypeId] = useState<string>("");
	const [qtyPurchased, setQtyPurchased] = useState<string>("");
	const [unitPrice, setUnitPrice] = useState<string>("");
	const [purchasedAt, setPurchasedAt] = useState<string>("");
	const [supplier, setSupplier] = useState<string>("");
	const [notes, setNotes] = useState<string>("");
	const [deleteLotId, setDeleteLotId] = useState<string | null>(null);
	const loadMoreRef = useRef<HTMLDivElement | null>(null);
	const { data: feedTypes = [] } = useGetFeedTypes({ farmId });
	const filters = useMemo(
		() => ({
			feedTypeId: filterFeedTypeId === "all" ? undefined : filterFeedTypeId,
			hasStock: stockFilter === "with_stock" ? true : undefined,
		}),
		[filterFeedTypeId, stockFilter],
	);
	const { data, isPending, hasNextPage, fetchNextPage, isFetchingNextPage } =
		useGetInfiniteFeedLots({
			farmId,
			filters,
			limit: 5,
		});
	const feedLots = data?.items ?? [];

	useEffect(() => {
		const target = loadMoreRef.current;
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
			{ rootMargin: "200px" },
		);

		observer.observe(target);

		return () => {
			observer.disconnect();
		};
	}, [fetchNextPage, hasNextPage, isFetchingNextPage, feedLots.length]);
	const hasFeedTypes = feedTypes.length > 0;
	const { mutateAsync: createFeedLot, isPending: isCreating } =
		useCreateFeedLot();
	const { mutateAsync: deleteFeedLot, isPending: isDeleting } =
		useDeleteFeedLotById();

	const handleCreate = async () => {
		if (!feedTypeId || !qtyPurchased || !unitPrice || !purchasedAt) {
			return;
		}

		await createFeedLot({
			farmId,
			payload: {
				feedTypeId,
				qtyPurchased: Number(qtyPurchased),
				unitPrice: Number(unitPrice),
				purchasedAt,
				supplier: supplier.trim() || undefined,
				notes: notes.trim() || undefined,
			},
		});
		setFeedTypeId("");
		setQtyPurchased("");
		setUnitPrice("");
		setPurchasedAt("");
		setSupplier("");
		setNotes("");
		setOpen(false);
	};

	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between gap-2">
				<CardTitle>{t("feedLots.title")}</CardTitle>
				<div className="flex items-center gap-2">
					<Select
						value={stockFilter}
						onValueChange={(value: "all" | "with_stock") =>
							setStockFilter(value)
						}
					>
						<SelectTrigger className="w-[130px]">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="with_stock">
								{t("feedLots.stockFilter.withStock")}
							</SelectItem>
							<SelectItem value="all">
								{t("feedLots.stockFilter.all")}
							</SelectItem>
						</SelectContent>
					</Select>
					<Dialog
						open={open}
						onOpenChange={setOpen}
					>
						<DialogTrigger asChild>
							<Button
								size="sm"
								disabled={!hasFeedTypes}
							>
								{t("feedLots.newButton")}
							</Button>
						</DialogTrigger>
						<DialogContent className="max-h-[90vh] overflow-y-auto">
							<DialogTitle>{t("feedLots.modal.title")}</DialogTitle>
							<DialogDescription>
								{t("feedLots.modal.description")}
							</DialogDescription>
							<div className="space-y-3">
								<Label>{t("feedLots.modal.feedType")}</Label>
								<Select
									value={feedTypeId}
									onValueChange={setFeedTypeId}
								>
									<SelectTrigger className="w-full">
										<SelectValue
											placeholder={t("feedLots.modal.feedTypePlaceholder")}
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
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
									<div>
										<Label>{t("feedLots.modal.quantity")}</Label>
										<Input
											type="number"
											min="0"
											step="0.01"
											value={qtyPurchased}
											onChange={(event) => setQtyPurchased(event.target.value)}
										/>
									</div>
									<div>
										<Label>{t("feedLots.modal.unitPrice")}</Label>
										<Input
											type="number"
											min="0"
											step="0.01"
											value={unitPrice}
											onChange={(event) => setUnitPrice(event.target.value)}
										/>
									</div>
								</div>
								<div>
									<Label>{t("feedLots.modal.purchaseDate")}</Label>
									<Input
										type="date"
										value={purchasedAt}
										onChange={(event) => setPurchasedAt(event.target.value)}
									/>
								</div>
								<div>
									<Label>{t("feedLots.modal.supplier")}</Label>
									<Input
										value={supplier}
										onChange={(event) => setSupplier(event.target.value)}
									/>
								</div>
								<div>
									<Label>{t("feedLots.modal.notes")}</Label>
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
									{t("feedLots.modal.create")}
								</Button>
							</div>
						</DialogContent>
					</Dialog>
				</div>
			</CardHeader>
			<CardContent className="space-y-3">
				{!hasFeedTypes ? (
					<div className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
						{t("feedLots.adminManagedNotice")}
					</div>
				) : null}
				<Select
					value={filterFeedTypeId}
					onValueChange={setFilterFeedTypeId}
				>
					<SelectTrigger className="w-full sm:w-[240px]">
						<SelectValue placeholder={t("feedLots.filterPlaceholder")} />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">{t("feedLots.allFeedTypes")}</SelectItem>
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
				{isPending ? (
					<p className="text-sm text-muted-foreground">
						{t("feedLots.loading")}
					</p>
				) : feedLots.length === 0 ? (
					<p className="text-sm text-muted-foreground">{t("feedLots.empty")}</p>
				) : (
					<div className="space-y-2">
						{feedLots.map((lot) => (
							<div
								key={lot.id}
								className="rounded-md border p-3 flex items-center justify-between gap-3"
							>
								<div className="text-sm">
									{/* Show feed type name */}
									<p className="font-semibold">
										{feedTypes.find((ft) => ft.id === lot.feedTypeId)?.name ||
											t("feedLots.unknownFeedType")}
									</p>
									<p className="font-medium">
										{t("feedLots.remaining", {
											remaining: lot.qtyRemaining,
											purchased: lot.qtyPurchased,
										})}
									</p>
									<p className="text-muted-foreground">
										{t("feedLots.purchasedLine", {
											date: lot.purchasedAt,
											price: lot.unitPrice.toFixed(2),
										})}
									</p>
								</div>
								{lot.qtyRemaining === lot.qtyPurchased ? (
									<Dialog
										open={deleteLotId === lot.id}
										onOpenChange={(open) =>
											setDeleteLotId(open ? lot.id : null)
										}
									>
										<DialogTrigger asChild>
											<Button
												variant="ghost"
												size="icon"
												className="h-8 w-8 bg-destructive hover:bg-destructive/90 text-white"
												disabled={isDeleting}
												aria-label={t("feedLots.delete")}
											>
												<Trash2 className="h-4 w-4" />
											</Button>
										</DialogTrigger>
										<DialogContent className="max-w-sm">
											<DialogTitle>
												{t("feedLots.deleteDialog.title")}
											</DialogTitle>
											<DialogDescription>
												{t("feedLots.deleteDialog.description")}
											</DialogDescription>
											<div className="flex justify-end gap-2">
												<Button
													variant="outline"
													onClick={() => setDeleteLotId(null)}
													disabled={isDeleting}
												>
													{t("feedLots.deleteDialog.cancel")}
												</Button>
												<Button
													variant="destructive"
													disabled={isDeleting}
													onClick={() =>
														void deleteFeedLot({
															feedLotId: lot.id,
															farmId,
														}).then(() => {
															setDeleteLotId(null);
														})
													}
												>
													{t("feedLots.deleteDialog.confirm")}
												</Button>
											</div>
										</DialogContent>
									</Dialog>
								) : null}
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
								{t("feedLots.loadingMore")}
							</p>
						) : null}
					</div>
				)}
			</CardContent>
		</Card>
	);
};
