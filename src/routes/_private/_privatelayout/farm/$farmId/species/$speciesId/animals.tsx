import { AnimalCardSkeletonList } from "@/components/common/skeleton-loaders";
import { FAB } from "@/components/common/fab";
import { SearchBar } from "@/components/common/search-bar";
import {
	FilterChips,
	type FilterOption,
} from "@/components/common/filter-chips";
import { Button } from "@/components/ui/button";
import { useGetAnimalsByFarmId } from "@/features/animal/api/animal-queries";
import { AnimalCardContainer } from "@/features/animal/components/animal-card-container";
import { NewAnimalModal } from "@/features/animal/components/new-animal-modal/new-animal-modal";
import { useGetSpeciesBySpecieId } from "@/features/specie/api/specie.queries";
import { ScrollablePageLayout } from "@/components/layout/scrollable-page-layout";
import { createFileRoute, useParams } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import type { IAnimal } from "@/features/animal/types/animal-types";
import { PageHeader } from "@/components/common/page-header";
import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";

export const Route = createFileRoute(
	"/_private/_privatelayout/farm/$farmId/species/$speciesId/animals",
)({
	component: RouteComponent,
});

function RouteComponent() {
	const PAGE_SIZE = 40;
	const { farmId, speciesId } = useParams({ strict: false });
	const { data: animalsData, isPending: isPendingAnimals } =
		useGetAnimalsByFarmId({
			farmId: farmId!,
			withLanguage: true,
			filters: {
				speciesId,
			},
		});
	const { data: speciesData, isPending: isPendingSpecies } =
		useGetSpeciesBySpecieId({
			include: "translations",
			withLanguage: true,
			speciesId: speciesId!,
		});

	const [searchQuery, setSearchQuery] = useState("");
	const [selectedFilter, setSelectedFilter] = useState("all");
	const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
	const [isNewAnimalModalOpen, setIsNewAnimalModalOpen] = useState(false);

	const { t } = useTranslation("animals");
	const filterOptions: FilterOption[] = useMemo(() => {
		if (!animalsData) return [];
		const aliveCount = animalsData.filter(
			(a: IAnimal) => a.status === "alive",
		).length;
		const deceasedCount = animalsData.filter(
			(a: IAnimal) => a.status === "deceased",
		).length;
		const soldCount = animalsData.filter(
			(a: IAnimal) => a.status === "sold",
		).length;

		return [
			{ label: t("filterButtonsAll"), value: "all", count: animalsData.length },
			{ label: t("filterButtonsAlive"), value: "alive", count: aliveCount },
			{ label: t("filterButtonsSold"), value: "sold", count: soldCount },
			{
				label: t("filterButtonsDeceased"),
				value: "deceased",
				count: deceasedCount,
			},
		];
	}, [animalsData, t]);

	const filteredAnimals = useMemo(() => {
		if (!animalsData) return [];

		let filtered = animalsData;
		if (selectedFilter !== "all") {
			filtered = filtered.filter(
				(animal: IAnimal) => animal.status === selectedFilter,
			);
		}
		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase();
			filtered = filtered.filter(
				(animal: IAnimal) =>
					animal.name?.toLowerCase().includes(query) ||
					animal.tagNumber.toLowerCase().includes(query),
			);
		}

		return filtered;
	}, [animalsData, selectedFilter, searchQuery]);

	const showAllFiltered = searchQuery.trim() || selectedFilter !== "all";
	const visibleAnimals = showAllFiltered
		? filteredAnimals
		: filteredAnimals.slice(0, visibleCount);

	if (isPendingAnimals || isPendingSpecies) {
		return (
			<ScrollablePageLayout
				header={
					<PageHeader
						title="Loading..."
						description={t("searchInputPlaceholder")}
						backLink={{
							to: "/farm/$farmId/species",
							params: { farmId: farmId! },
						}}
					/>
				}
			>
				<AnimalCardSkeletonList count={5} />
			</ScrollablePageLayout>
		);
	}

	return (
		<>
			<ScrollablePageLayout
				header={
					<div className="flex flex-col gap-6">
						<PageHeader
							title={speciesData?.translations?.[0].name || ""}
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
								onChange={setSearchQuery}
								placeholder={t("searchInputPlaceholder")}
							/>
							<FilterChips
								options={filterOptions}
								selected={selectedFilter}
								onSelect={setSelectedFilter}
							/>
						</div>
					</div>
				}
			>
				{filteredAnimals.length > 0 ? (
					<div className="space-y-3">
						<AnimalCardContainer
							animalsList={visibleAnimals}
							sex=""
						/>
						{!showAllFiltered && visibleCount < filteredAnimals.length && (
							<div className="pt-2">
								<Button
									variant="outline"
									onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
								>
									{t("loadMore")}
								</Button>
							</div>
						)}
						<p className="text-caption text-muted-foreground">
							{t("showingCount", {
								visible: visibleAnimals.length,
								total: filteredAnimals.length,
							})}
						</p>
					</div>
				) : (
					<div className="p-8 text-center text-muted-foreground">
						{searchQuery || selectedFilter !== "all"
							? t("noAnimalsMatch")
							: t("noAnimalsFound")}
					</div>
				)}
			</ScrollablePageLayout>

			<NewAnimalModal
				open={isNewAnimalModalOpen}
				onOpenChange={setIsNewAnimalModalOpen}
				preselectedSpecieId={speciesId}
			/>
			<FAB
				icon={Plus}
				onClick={() => setIsNewAnimalModalOpen(true)}
				className="md:hidden"
				ariaLabel={t("addAnimalButton")}
			/>
		</>
	);
}
