import { PageHeader } from "@/components/common/page-header";
import { ScrollablePageLayout } from "@/components/layout/scrollable-page-layout";
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

	const { data: flock, isPending: isFlockLoading } = useGetFlockById({
		flockId: flockId!,
		include: "species.translations,breed.translations",
	});
	const { data: eventData, isPending: isEventsLoading } = useGetFlockEventsPage(
		{
			flockId: flockId!,
			page: 1,
			limit: 10,
		},
	);
	const { data: eggCollectionData, isPending: isEggCollectionsLoading } =
		useGetEggCollectionsPage({
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
