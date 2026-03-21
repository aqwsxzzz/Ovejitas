import { PageHeader } from "@/components/common/page-header";
import { ScrollablePageLayout } from "@/components/layout/scrollable-page-layout";
import { Button } from "@/components/ui/button";
import { useGetFlocksPage } from "@/features/flock/api/flock-queries";
import { CreateFlockModal } from "@/features/flock/components/create-flock-modal";
import { FlockList } from "@/features/flock/components/flock-list";
import type {
	IFlockListFilters,
	IFlockStatus,
	IFlockType,
} from "@/features/flock/types/flock-types";
import { createFileRoute, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ApiRequestError } from "@/lib/axios/axios-helper";

export const Route = createFileRoute(
	"/_private/_privatelayout/farm/$farmId/flocks",
)({
	component: RouteComponent,
});

const pageSizeOptions = [10, 20, 50];

function RouteComponent() {
	const { t } = useTranslation("flocks");
	const { farmId } = useParams({ strict: false });
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);
	const [filters, setFilters] = useState<Partial<IFlockListFilters>>({});

	const { data, isPending, isError, error, refetch, isFetching } =
		useGetFlocksPage({
			farmId: farmId!,
			filters,
			page,
			limit: pageSize,
			include: "species.translations,breed.translations",
		});

	const flocks = data?.items ?? [];
	const totalPages = data?.totalPages ?? 1;
	const total = data?.total ?? flocks.length;
	const isEndpointUnavailable =
		error instanceof ApiRequestError && error.statusCode === 404;

	const onStatusChange = (nextStatus: string) => {
		setFilters((previous) => ({
			...previous,
			status: nextStatus === "all" ? undefined : (nextStatus as IFlockStatus),
		}));
		setPage(1);
	};

	const onFlockTypeChange = (nextFlockType: string) => {
		setFilters((previous) => ({
			...previous,
			flockType:
				nextFlockType === "all" ? undefined : (nextFlockType as IFlockType),
		}));
		setPage(1);
	};

	return (
		<ScrollablePageLayout
			className="max-w-5xl mx-auto pb-24"
			header={
				<PageHeader
					title={t("page.title")}
					description={t("page.description")}
					action={<CreateFlockModal farmId={farmId!} />}
				/>
			}
		>
			<div className="flex flex-col gap-4">
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
					<select
						className="h-9 rounded-md border border-input bg-background px-2 text-sm"
						value={filters.status ?? "all"}
						onChange={(event) => onStatusChange(event.target.value)}
					>
						<option value="all">{t("filters.allStatuses")}</option>
						<option value="active">{t("status.active")}</option>
						<option value="sold">{t("status.sold")}</option>
						<option value="culled">{t("status.culled")}</option>
						<option value="completed">{t("status.completed")}</option>
					</select>
					<select
						className="h-9 rounded-md border border-input bg-background px-2 text-sm"
						value={filters.flockType ?? "all"}
						onChange={(event) => onFlockTypeChange(event.target.value)}
					>
						<option value="all">{t("filters.allTypes")}</option>
						<option value="layers">{t("flockType.layers")}</option>
						<option value="broilers">{t("flockType.broilers")}</option>
						<option value="dual_purpose">{t("flockType.dual_purpose")}</option>
						<option value="general">{t("flockType.general")}</option>
					</select>
				</div>

				{isPending && (
					<div className="rounded-card border p-8 text-center text-muted-foreground">
						{t("page.loading")}
					</div>
				)}

				{isError && (
					<div className="rounded-card border p-4 flex flex-col gap-2">
						<p className="text-destructive text-sm">
							{isEndpointUnavailable
								? t("page.endpointUnavailable")
								: error.message}
						</p>
						{isEndpointUnavailable && (
							<p className="text-muted-foreground text-sm">
								{t("page.endpointUnavailableHint")}
							</p>
						)}
						<div>
							<Button
								variant="outline"
								onClick={() => void refetch()}
							>
								{t("page.retry")}
							</Button>
						</div>
					</div>
				)}

				{!isPending && !isError && flocks.length === 0 && (
					<div className="rounded-card border p-8 text-center text-muted-foreground">
						{t("page.empty")}
					</div>
				)}

				{!isPending && !isError && flocks.length > 0 && (
					<div className="space-y-3">
						<FlockList flocks={flocks} />
						<div className="flex flex-wrap items-center gap-2">
							<label className="text-caption text-muted-foreground">
								{t("page.perPage")}
							</label>
							<select
								className="h-9 rounded-md border border-input bg-background px-2 text-sm"
								value={pageSize}
								onChange={(event) => {
									setPageSize(Number(event.target.value));
									setPage(1);
								}}
							>
								{pageSizeOptions.map((option) => (
									<option
										key={option}
										value={option}
									>
										{option}
									</option>
								))}
							</select>
							<Button
								variant="outline"
								onClick={() => setPage((previous) => Math.max(previous - 1, 1))}
								disabled={page <= 1 || isFetching}
							>
								{t("page.previous")}
							</Button>
							<Button
								variant="outline"
								onClick={() =>
									setPage((previous) => Math.min(previous + 1, totalPages))
								}
								disabled={page >= totalPages || isFetching}
							>
								{t("page.next")}
							</Button>
							<span className="text-caption text-muted-foreground">
								{t("page.pageLabel", { page, totalPages })}
							</span>
						</div>
						<p className="text-caption text-muted-foreground">
							{t("page.showingCount", {
								visible: flocks.length,
								total,
							})}
						</p>
					</div>
				)}
			</div>
		</ScrollablePageLayout>
	);
}
