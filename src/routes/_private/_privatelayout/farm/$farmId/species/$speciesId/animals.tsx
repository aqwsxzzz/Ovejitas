import { CardStyleHeader } from "@/components/common/card-style-header";
import { AnimalCardSkeletonList } from "@/components/common/skeleton-loaders";
import { SearchBar } from "@/components/common/search-bar";
import { FilterChips, type FilterOption } from "@/components/common/filter-chips";
import { useGetAnimalsByFarmId } from "@/features/animal/api/animal-queries";
import { AnimalCardContainer } from "@/features/animal/components/animal-card-container";
import { NewAnimalModal } from "@/features/animal/components/new-animal-modal/new-animal-modal";
import { useGetSpeciesBySpecieId } from "@/features/specie/api/specie.queries";
import { createFileRoute, useParams } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import type { IAnimal } from "@/features/animal/types/animal-types";

export const Route = createFileRoute(
	"/_private/_privatelayout/farm/$farmId/species/$speciesId/animals",
)({
	component: RouteComponent,
});

function RouteComponent() {
	const { farmId, speciesId } = useParams({ strict: false });
	const { data: animalsData, isPending: isPendingAnimals } =
		useGetAnimalsByFarmId({
			farmId: farmId!,
			withLanguage: true,
			filters: {
				speciesId
			}
		});
	const { data: speciesData, isPending: isPendingSpecies } =
		useGetSpeciesBySpecieId({
			include: "translations",
			withLanguage: true,
			speciesId: speciesId!,
		});

	const [searchQuery, setSearchQuery] = useState("");
	const [selectedFilter, setSelectedFilter] = useState("all");

	// Calculate filter options with counts
	const filterOptions: FilterOption[] = useMemo(() => {
		if (!animalsData) return [];
		const aliveCount = animalsData.filter((a: IAnimal) => a.status === "alive").length;
		const deceasedCount = animalsData.filter((a: IAnimal) => a.status === "deceased").length;
		const soldCount = animalsData.filter((a: IAnimal) => a.status === "sold").length;

		return [
			{ label: "All", value: "all", count: animalsData.length },
			{ label: "Alive", value: "alive", count: aliveCount },
			{ label: "Sold", value: "sold", count: soldCount },
			{ label: "Deceased", value: "deceased", count: deceasedCount },
		];
	}, [animalsData]);

	// Filter and search animals
	const filteredAnimals = useMemo(() => {
		if (!animalsData) return [];

		let filtered = animalsData;

		// Apply status filter
		if (selectedFilter !== "all") {
			filtered = filtered.filter((animal: IAnimal) => animal.status === selectedFilter);
		}

		// Apply search filter
		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase();
			filtered = filtered.filter((animal: IAnimal) =>
				animal.name?.toLowerCase().includes(query) ||
				animal.tagNumber.toLowerCase().includes(query)
			);
		}

		return filtered;
	}, [animalsData, selectedFilter, searchQuery]);

	if (isPendingAnimals || isPendingSpecies) {
		return (
			<div className="flex flex-col gap-2">
				<CardStyleHeader
					title="Loading..."
					Modal={NewAnimalModal}
					backLink={{
						to: "/farm/$farmId/species",
						params: { farmId: farmId! }
					}}
				/>
				<AnimalCardSkeletonList count={5} />
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-2">
			<CardStyleHeader
				title={speciesData?.translations?.[0].name || ''}
				Modal={NewAnimalModal}
				backLink={{
					to: "/farm/$farmId/species",
					params: { farmId: farmId! }
				}}
			/>

			{/* Search and Filters */}
			<div className="flex flex-col gap-3">
				<SearchBar
					value={searchQuery}
					onChange={setSearchQuery}
					placeholder="Search by name or tag..."
				/>
				<FilterChips
					options={filterOptions}
					selected={selectedFilter}
					onSelect={setSelectedFilter}
				/>
			</div>

			{/* Animals List */}
			{filteredAnimals.length > 0 ? (
				<AnimalCardContainer
					animalsList={filteredAnimals}
					sex=""
				/>
			) : (
				<div className="text-center text-muted-foreground p-8">
					{searchQuery || selectedFilter !== "all"
						? "No animals match your search or filter"
						: "No animals found"}
				</div>
			)}
		</div>
	);
}
