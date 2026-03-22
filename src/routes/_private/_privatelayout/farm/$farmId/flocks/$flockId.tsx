import { PageHeader } from "@/components/common/page-header";
import { ScrollablePageLayout } from "@/components/layout/scrollable-page-layout";
import { Button } from "@/components/ui/button";
import {
	useGetEggCollectionsPage,
	useGetFlockById,
	useGetFlockEventsPage,
} from "@/features/flock/api/flock-queries";
import { EggCollectionsList } from "@/features/flock/components/egg-collections-list";
import { FlockEventsList } from "@/features/flock/components/flock-events-list";
import { createFileRoute, useParams } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute(
	"/_private/_privatelayout/farm/$farmId/flocks/$flockId",
)({
	component: RouteComponent,
});

function RouteComponent() {
	const { t } = useTranslation("flocks");
	const { flockId } = useParams({ strict: false });
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
	} = useGetFlockEventsPage({
		flockId: flockId!,
		page: 1,
		limit: 10,
	});
	const {
		data: eggCollectionData,
		isPending: isEggCollectionsLoading,
		isError: isEggCollectionsError,
		error: eggCollectionsError,
		refetch: refetchEggCollections,
	} = useGetEggCollectionsPage({
		flockId: flockId!,
		page: 1,
		limit: 10,
	});

	return (
		<ScrollablePageLayout
			className="max-w-5xl mx-auto pb-24"
			header={
				<PageHeader
					title={flock?.name ?? t("detail.title")}
					description={t("detail.description")}
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
							<FlockEventsList events={eventData?.items ?? []} />
						)}
					</section>

					<section className="space-y-2">
						<h2 className="text-h2">{t("detail.eggCollections.title")}</h2>
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
							<EggCollectionsList
								eggCollections={eggCollectionData?.items ?? []}
							/>
						)}
					</section>
				</div>
			)}
		</ScrollablePageLayout>
	);
}
