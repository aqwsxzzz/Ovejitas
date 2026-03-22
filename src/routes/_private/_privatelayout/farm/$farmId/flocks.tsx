import { PageHeader } from "@/components/common/page-header";
import { ScrollablePageLayout } from "@/components/layout/scrollable-page-layout";
import { Button } from "@/components/ui/button";
import { useGetFlocksPage } from "@/features/flock/api/flock-queries";
import { CreateFlockModal } from "@/features/flock/components/create-flock-modal";
import { FlockFilterPanel } from "@/features/flock/components/flock-filter-panel";
import { FlockList } from "@/features/flock/components/flock-list";
import {
	FlockDesktopSummaryCard,
	FlockMobileSummaryStats,
} from "@/features/flock/components/flock-summary-stats";
import type {
	IFlockListFilters,
	IFlockStatus,
	IFlockType,
} from "@/features/flock/types/flock-types";
import { createFileRoute, useParams } from "@tanstack/react-router";
import { ListFilter, Plus, Tractor } from "lucide-react";
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
	const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
	const [isCreateOpen, setIsCreateOpen] = useState(false);

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
	const totalAnimals = flocks.reduce(
		(sum, flock) => sum + flock.currentCount,
		0,
	);
	const activeFlocks = flocks.filter(
		(flock) => flock.status === "active",
	).length;
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

	const filterSelects = (
		<div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
			<select
				className="h-11 rounded-2xl border border-input bg-background px-3 text-sm"
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
				className="h-11 rounded-2xl border border-input bg-background px-3 text-sm"
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
	);

	const pagination = (
		<div className="space-y-3">
			<div className="flex flex-wrap items-center gap-2">
				<label className="text-caption text-muted-foreground">
					{t("page.perPage")}
				</label>
				<select
					className="h-10 rounded-xl border border-input bg-background px-2 text-sm"
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
					className="rounded-xl"
				>
					{t("page.previous")}
				</Button>
				<Button
					variant="outline"
					onClick={() =>
						setPage((previous) => Math.min(previous + 1, totalPages))
					}
					disabled={page >= totalPages || isFetching}
					className="rounded-xl"
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
	);

	return (
		<ScrollablePageLayout
			className="mx-auto max-w-7xl pb-24"
			header={
				<>
					<div className="md:hidden">
						<PageHeader
							title={t("page.title")}
							description={t("page.description")}
							action={
							<Button onClick={() => setIsCreateOpen(true)}>
								<Plus className="h-4 w-4" />
								{t("page.newButton")}
							</Button>
						}
						/>
					</div>
					<div className="hidden items-center justify-between rounded-[24px] border border-border/70 bg-card px-5 py-4 shadow-sm md:flex">
						<div className="flex items-center gap-3">
							<div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary/60 text-foreground">
								<Tractor className="h-5 w-5" />
							</div>
							<div>
								<h1 className="text-h1 text-foreground">{t("page.title")}</h1>
								<p className="text-small text-muted-foreground">
									{t("page.description")}
								</p>
							</div>
						</div>
						<nav className="flex items-center gap-8 text-sm font-semibold text-muted-foreground">
							<span className="text-foreground">{t("desktopNav.flocks")}</span>
							<span>{t("desktopNav.reports")}</span>
							<span>{t("desktopNav.health")}</span>
							<span>{t("desktopNav.profile")}</span>
						</nav>
						<Button onClick={() => setIsCreateOpen(true)}>
							<Plus className="h-4 w-4" />
							{t("page.newButton")}
						</Button>
					</div>
				</>
			}
		>
			<div className="flex flex-col gap-4">
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
					<>
						<div className="space-y-4 md:hidden">
							<FlockMobileSummaryStats
								totalFlocks={total}
								activeFlocks={activeFlocks}
								totalAnimals={totalAnimals}
							/>
							<div className="space-y-3">
								<Button
									variant="outline"
									onClick={() =>
										setIsMobileFiltersOpen((previous) => !previous)
									}
									className="h-11 w-full justify-between rounded-2xl"
								>
									<span>{t("page.filtersToggle")}</span>
									<ListFilter className="h-4 w-4" />
								</Button>
								{isMobileFiltersOpen && filterSelects}
							</div>
							<FlockList flocks={flocks} />
							{pagination}
						</div>

						<div className="hidden md:grid md:grid-cols-[288px_minmax(0,1fr)] md:gap-6">
							<div className="space-y-4">
								<FlockFilterPanel
									filters={filters}
									onStatusChange={onStatusChange}
									onFlockTypeChange={onFlockTypeChange}
								/>
								<FlockDesktopSummaryCard
									totalFlocks={total}
									activeFlocks={activeFlocks}
									totalAnimals={totalAnimals}
								/>
							</div>
							<div className="space-y-4">
								<FlockList
									flocks={flocks}
									className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3"
								/>
								{pagination}
							</div>
						</div>
					</>
				)}
			</div>
		<CreateFlockModal
			farmId={farmId!}
			open={isCreateOpen}
			onOpenChange={setIsCreateOpen}
		/>
		</ScrollablePageLayout>
	);
}
