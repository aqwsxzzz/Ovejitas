import { SearchBar } from "@/components/common/search-bar";
import {
	FilterChips,
	type FilterOption,
} from "@/components/common/filter-chips";
import { Button } from "@/components/ui/button";
import {
	useGetAnimalsByFarmIdPage,
	useSearchAnimalsPaged,
} from "@/features/animal/api/animal-queries";
import { AnimalCardContainer } from "@/features/animal/components/animal-card-container";
import { NewAnimalModal } from "@/features/animal/components/new-animal-modal/new-animal-modal";
import { useGetSpeciesBySpecieId } from "@/features/specie/api/specie.queries";
import { ScrollablePageLayout } from "@/components/layout/scrollable-page-layout";
import { createFileRoute, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/common/page-header";
import { useTranslation } from "react-i18next";
import { useDebouncedValue } from "@/utils/use-debounced-value";
import { FarmAnimalSpinner } from "@/components/common/farm-animal-spinner";

export const Route = createFileRoute(
	"/_private/_privatelayout/farm/$farmId/species/$speciesId/animals",
)({
	component: RouteComponent,
});

function RouteComponent() {
	const pageSizeOptions = [5, 10, 20, 50];
	const scrollToTop = () => {
		const scrollContainer = document.getElementById("app-scroll-container");
		if (scrollContainer) {
			scrollContainer.scrollTo({ top: 0, behavior: "smooth" });
			return;
		}

		window.scrollTo({ top: 0, behavior: "smooth" });
	};
	const { farmId, speciesId } = useParams({ strict: false });
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedSex, setSelectedSex] = useState("all");
	const [isNewAnimalModalOpen, setIsNewAnimalModalOpen] = useState(false);
	const isSearchActive = searchQuery.trim().length > 0;
	const debouncedSearchQuery = useDebouncedValue(searchQuery.trim(), 350);
	const isDebouncing =
		isSearchActive && debouncedSearchQuery !== searchQuery.trim();
	const sexFilter =
		selectedSex !== "all"
			? (selectedSex as "female" | "male" | "unknown")
			: undefined;
	const {
		data: pagedAnimals,
		isPending: isPendingList,
		isFetching: isFetchingList,
	} = useGetAnimalsByFarmIdPage({
		farmId: farmId!,
		withLanguage: true,
		filters: { speciesId, sex: sexFilter },
		page,
		limit: pageSize,
		enabled: !isSearchActive,
	});
	const { data: searchedAnimals, isFetching: isFetchingSearch } =
		useSearchAnimalsPaged({
			filters: { q: debouncedSearchQuery, speciesId, sex: sexFilter },
			page,
			limit: pageSize,
		});
	const activeData =
		debouncedSearchQuery.length > 0 ? searchedAnimals : pagedAnimals;
	const animalsData = activeData?.items ?? [];
	const totalAnimals = activeData?.total ?? 0;
	const totalPages = activeData?.totalPages ?? 1;
	const isPendingAnimals = !isSearchActive && isPendingList;
	const isFetching = isFetchingList || isFetchingSearch || isDebouncing;
	const { data: speciesData, isPending: isPendingSpecies } =
		useGetSpeciesBySpecieId({
			include: "translations",
			withLanguage: true,
			speciesId: speciesId!,
		});

	const { t } = useTranslation("animals");
	const sexOptions: FilterOption[] = [
		{ label: t("filterButtonsAll"), value: "all" },
		{ label: t("filterButtonsFemale"), value: "female" },
		{ label: t("filterButtonsMale"), value: "male" },
		{ label: t("filterButtonsUnknown"), value: "unknown" },
	];

	return (
		<>
			<ScrollablePageLayout
				header={
					<div className="flex flex-col gap-6">
						<PageHeader
							title={speciesData?.translations?.[0].name ?? ""}
							description={t("searchSubtitle")}
							backLink={{
								to: "/farm/$farmId/species",
								params: { farmId: farmId! },
							}}
							action={
								<Button onClick={() => setIsNewAnimalModalOpen(true)}>
									{t("addAnimalButton")}
								</Button>
							}
						/>
						<div className="flex flex-col gap-3">
							<SearchBar
								value={searchQuery}
								onChange={(value) => {
									setSearchQuery(value);
									setPage(1);
									scrollToTop();
								}}
								placeholder={t("searchInputPlaceholder")}
							/>
							<FilterChips
								options={sexOptions}
								selected={selectedSex}
								onSelect={(value) => {
									setSelectedSex(value);
									setPage(1);
									scrollToTop();
								}}
							/>
						</div>
					</div>
				}
			>
				{isPendingAnimals || isPendingSpecies ? (
					<div className="flex min-h-[260px] flex-col items-center justify-center gap-4">
						<FarmAnimalSpinner
							size="md"
							speed="slow"
						/>
						<p className="text-caption text-muted-foreground">Loading...</p>
					</div>
				) : animalsData.length > 0 ? (
					<div className="space-y-3">
						<AnimalCardContainer
							animalsList={animalsData}
							sex=""
						/>
						<div className="flex flex-wrap items-center gap-2 pt-2">
							<label className="text-caption text-muted-foreground">
								{t("perPage")}
							</label>
							<select
								className="h-9 rounded-md border border-input bg-background px-2 text-sm"
								value={pageSize}
								onChange={(event) => {
									setPageSize(Number(event.target.value));
									setPage(1);
									scrollToTop();
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
								onClick={() => {
									setPage((previous) => Math.max(previous - 1, 1));
									scrollToTop();
								}}
								disabled={page <= 1 || isFetching}
							>
								{t("previous")}
							</Button>
							<Button
								variant="outline"
								onClick={() => {
									setPage((previous) => Math.min(previous + 1, totalPages));
									scrollToTop();
								}}
								disabled={page >= totalPages || isFetching}
							>
								{t("next")}
							</Button>
							<span className="text-caption text-muted-foreground">
								{t("pageLabel", { page, totalPages })}
							</span>
						</div>
						<p className="text-caption text-muted-foreground">
							{t("showingCount", {
								visible: animalsData.length,
								total: totalAnimals,
							})}
						</p>
					</div>
				) : (
					<div className="p-8 text-center text-muted-foreground">
						{searchQuery ? t("noAnimalsMatch") : t("noAnimalsFound")}
					</div>
				)}
			</ScrollablePageLayout>

			<NewAnimalModal
				open={isNewAnimalModalOpen}
				onOpenChange={setIsNewAnimalModalOpen}
				preselectedSpecieId={speciesId}
			/>
			{/* Floating FAB for animal creation removed as per requirements */}
		</>
	);
}
