import { PageHeader } from "@/components/common/page-header";
import { ScrollablePageLayout } from "@/components/layout/scrollable-page-layout";
import { Button } from "@/components/ui/button";
import {
	useGetInfiniteEggCollections,
	useGetInfiniteFlockEvents,
	useGetFlockById,
	useLogTodaysFeeding,
} from "@/features/flock/api/flock-queries";
import { EggCollectionsList } from "@/features/flock/components/egg-collections-list";
import { FlockEventsList } from "@/features/flock/components/flock-events-list";
import { RecordEggCollectionModal } from "@/features/flock/components/record-egg-collection-modal";
import { UpdateFlockCountModal } from "@/features/flock/components/update-flock-count-modal";
import { createFileRoute, useParams } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute(
	"/_private/_privatelayout/farm/$farmId/flocks/$flockId",
)({
	component: RouteComponent,
});

function RouteComponent() {
	const { t } = useTranslation("flocks");
	const { flockId, farmId } = useParams({ strict: false });
	const getErrorMessage = (error: unknown, fallback: string): string => {
		if (error instanceof Error && error.message) {
			return error.message;
		}

		return fallback;
	};

	const {
		data: flock,
		isPending: isFlockLoading,
		isError: isFlockError,
		error: flockError,
		refetch: refetchFlock,
	} = useGetFlockById({
		flockId: flockId!,
		include: "species.translations,breed.translations",
	});
	const {
		data: eventData,
		isPending: isEventsLoading,
		isError: isEventsError,
		error: eventsError,
		refetch: refetchEvents,
		hasNextPage: hasMoreEvents,
		fetchNextPage: fetchMoreEvents,
		isFetchingNextPage: isFetchingMoreEvents,
	} = useGetInfiniteFlockEvents({
		flockId: flockId!,
		limit: 5,
	});

	const isLayingFlock =
		flock?.flockType === "layers" || flock?.flockType === "dual_purpose";
	const { mutateAsync: logTodaysFeeding, isPending: isLoggingTodaysFeeding } =
		useLogTodaysFeeding();

	const {
		data: eggCollectionData,
		isPending: isEggCollectionsLoading,
		isError: isEggCollectionsError,
		error: eggCollectionsError,
		refetch: refetchEggCollections,
		hasNextPage: hasMoreEggCollections,
		fetchNextPage: fetchMoreEggCollections,
		isFetchingNextPage: isFetchingMoreEggCollections,
	} = useGetInfiniteEggCollections({
		flockId: flockId!,
		limit: 5,
	});

	const eventsLoadMoreRef = useRef<HTMLDivElement | null>(null);
	const eventsScrollContainerRef = useRef<HTMLDivElement | null>(null);
	const eggCollectionsLoadMoreRef = useRef<HTMLDivElement | null>(null);
	const eggCollectionsScrollContainerRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		const target = eventsLoadMoreRef.current;
		const root = eventsScrollContainerRef.current;
		if (!target || !root || !hasMoreEvents) {
			return;
		}

		const observer = new IntersectionObserver(
			(entries) => {
				const entry = entries[0];
				if (!entry?.isIntersecting || isFetchingMoreEvents) {
					return;
				}

				void fetchMoreEvents();
			},
			{ root, rootMargin: "200px" },
		);

		observer.observe(target);

		return () => {
			observer.disconnect();
		};
	}, [fetchMoreEvents, hasMoreEvents, isFetchingMoreEvents]);

	useEffect(() => {
		const target = eggCollectionsLoadMoreRef.current;
		const root = eggCollectionsScrollContainerRef.current;
		if (!target || !root || !hasMoreEggCollections) {
			return;
		}

		const observer = new IntersectionObserver(
			(entries) => {
				const entry = entries[0];
				if (!entry?.isIntersecting || isFetchingMoreEggCollections) {
					return;
				}

				void fetchMoreEggCollections();
			},
			{ root, rootMargin: "200px" },
		);

		observer.observe(target);

		return () => {
			observer.disconnect();
		};
	}, [
		fetchMoreEggCollections,
		hasMoreEggCollections,
		isFetchingMoreEggCollections,
	]);

	return (
		<ScrollablePageLayout
			className="max-w-5xl mx-auto pb-0"
			header={
				<PageHeader
					title={flock?.name ?? t("detail.title")}
					description={t("detail.description")}
					backLink={{
						to: "/farm/$farmId/flocks",
						params: { farmId: farmId! },
					}}
				/>
			}
		>
			{isFlockLoading ? (
				<div className="rounded-card border p-6 text-center text-muted-foreground">
					{t("detail.loading")}
				</div>
			) : isFlockError ? (
				<div className="rounded-card border p-4 flex flex-col gap-2">
					<p className="text-destructive text-sm">
						{getErrorMessage(flockError, t("detail.loading"))}
					</p>
					<div>
						<Button
							variant="outline"
							onClick={() => void refetchFlock()}
						>
							{t("page.retry")}
						</Button>
					</div>
				</div>
			) : (
				<div className="space-y-4">
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
						<div className="rounded-card border p-4">
							<p className="text-sm text-muted-foreground">
								{t("fields.currentCount")}
							</p>
							<p className="text-xl font-semibold">
								{flock?.currentCount ?? 0}
							</p>
						</div>
						<div className="rounded-card border p-4">
							<p className="text-sm text-muted-foreground">
								{t("fields.initialCount")}
							</p>
							<p className="text-xl font-semibold">
								{flock?.initialCount ?? 0}
							</p>
						</div>
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
						<UpdateFlockCountModal
							flock={flock!}
							farmId={farmId!}
							buttonClassName="h-11 w-full justify-center rounded-xl border border-border/50 bg-transparent font-bold text-foreground hover:bg-muted/50"
							editorClassName="w-full min-w-0"
						/>
						<Button
							variant="outline"
							className="h-11 rounded-xl"
							disabled={isLoggingTodaysFeeding}
							onClick={() =>
								void logTodaysFeeding({
									flockId: flockId!,
									farmId: farmId!,
								})
							}
						>
							{isLoggingTodaysFeeding
								? t("detail.logToday.logging")
								: t("detail.logToday.action")}
						</Button>
					</div>

					<section className="space-y-2">
						<h2 className="text-h2">{t("detail.events.title")}</h2>
						{isEventsLoading ? (
							<div className="rounded-card border p-6 text-center text-muted-foreground">
								{t("detail.events.loading")}
							</div>
						) : isEventsError ? (
							<div className="rounded-card border p-4 flex flex-col gap-2">
								<p className="text-destructive text-sm">
									{getErrorMessage(eventsError, t("detail.events.loading"))}
								</p>
								<div>
									<Button
										variant="outline"
										onClick={() => void refetchEvents()}
									>
										{t("page.retry")}
									</Button>
								</div>
							</div>
						) : (
							<div
								ref={eventsScrollContainerRef}
								className="h-72 overflow-y-auto overscroll-contain pr-1"
							>
								<FlockEventsList events={eventData?.items ?? []} />
								{hasMoreEvents ? (
									<div
										ref={eventsLoadMoreRef}
										className="h-2"
									/>
								) : null}
								{isFetchingMoreEvents ? (
									<p className="text-sm text-muted-foreground">
										{t("detail.events.loadingMore")}
									</p>
								) : null}
							</div>
						)}
					</section>

					{isLayingFlock && (
						<section className="space-y-2">
							<div className="flex items-center justify-between gap-2">
								<h2 className="text-h2">{t("detail.eggCollections.title")}</h2>
								<RecordEggCollectionModal
									mode="create"
									flockId={flockId!}
									farmId={farmId!}
								/>
							</div>
							{isEggCollectionsLoading ? (
								<div className="rounded-card border p-6 text-center text-muted-foreground">
									{t("detail.eggCollections.loading")}
								</div>
							) : isEggCollectionsError ? (
								<div className="rounded-card border p-4 flex flex-col gap-2">
									<p className="text-destructive text-sm">
										{getErrorMessage(
											eggCollectionsError,
											t("detail.eggCollections.loading"),
										)}
									</p>
									<div>
										<Button
											variant="outline"
											onClick={() => void refetchEggCollections()}
										>
											{t("page.retry")}
										</Button>
									</div>
								</div>
							) : (
								<div
									ref={eggCollectionsScrollContainerRef}
									className="h-72 overflow-y-auto overscroll-contain pr-1"
								>
									<EggCollectionsList
										eggCollections={eggCollectionData?.items ?? []}
										flockId={flockId!}
										farmId={farmId!}
									/>
									{hasMoreEggCollections ? (
										<div
											ref={eggCollectionsLoadMoreRef}
											className="h-2"
										/>
									) : null}
									{isFetchingMoreEggCollections ? (
										<p className="text-sm text-muted-foreground">
											{t("detail.eggCollections.loadingMore")}
										</p>
									) : null}
								</div>
							)}
						</section>
					)}
				</div>
			)}
		</ScrollablePageLayout>
	);
}
