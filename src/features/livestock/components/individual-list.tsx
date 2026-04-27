import { useState } from "react";
import type { ILivestockIndividual } from "@/features/livestock/types/livestock-types";

const STATUS_COLORS = {
	active: "text-green-700 bg-green-50",
	sold: "text-amber-700 bg-amber-50",
	deceased: "text-red-700 bg-red-50",
};

const SEX_SYMBOL = {
	male: "♂",
	female: "♀",
	unknown: "–",
};

interface IndividualListProps {
	individuals: ILivestockIndividual[];
	isLoading?: boolean;
	onSelectIndividual?: (individual: ILivestockIndividual) => void;
	onEditIndividual?: (individual: ILivestockIndividual) => void;
	onDeleteIndividual?: (individual: ILivestockIndividual) => Promise<void>;
	onCreateIndividual?: () => void;
}

export function IndividualList({
	individuals,
	isLoading = false,
	onSelectIndividual,
	onEditIndividual,
	onDeleteIndividual,
	onCreateIndividual,
}: IndividualListProps) {
	const [searchQuery, setSearchQuery] = useState("");
	const [deletingId, setDeletingId] = useState<string | null>(null);

	const filtered = individuals.filter((ind) => {
		const q = searchQuery.toLowerCase();
		return (
			(ind.name?.toLowerCase().includes(q) ?? false) ||
			ind.tag.toLowerCase().includes(q)
		);
	});

	const handleDelete = async (individual: ILivestockIndividual) => {
		if (!confirm(`Delete ${individual.name || individual.tag}?`)) return;

		try {
			setDeletingId(individual.id);
			await onDeleteIndividual?.(individual);
		} finally {
			setDeletingId(null);
		}
	};

	return (
		<div className="space-y-4">
			{/* Header */}
			<div className="flex items-center justify-between gap-2">
				<h2 className="text-lg font-bold">Individuals</h2>
				{onCreateIndividual && (
					<button
						onClick={onCreateIndividual}
						className="rounded-lg bg-blue-600 px-3 py-1 text-sm font-medium text-white hover:bg-blue-700"
					>
						+ Add Individual
					</button>
				)}
			</div>

			{/* Search */}
			<div className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2">
				<span className="text-gray-400">🔍</span>
				<input
					type="search"
					placeholder="Search by name or tag..."
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					className="flex-1 bg-transparent outline-none"
				/>
			</div>

			{/* List */}
			{isLoading ? (
				<div className="py-8 text-center text-gray-500">Loading...</div>
			) : filtered.length === 0 ? (
				<div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 py-8 text-center text-gray-500">
					{individuals.length === 0
						? "No individuals yet"
						: "No individuals match your search"}
				</div>
			) : (
				<div className="divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white">
					{filtered.map((individual) => (
						<div
							key={individual.id}
							className="flex items-center justify-between gap-4 p-4 hover:bg-gray-50"
						>
							<button
								onClick={() => onSelectIndividual?.(individual)}
								className="flex-1 text-left"
							>
								<div className="flex items-center gap-3">
									<div>
										<p className="font-semibold">
											{individual.name || individual.tag}
										</p>
										<p className="text-sm text-gray-600">
											{individual.tag}
											{individual.sex &&
												` · ${SEX_SYMBOL[individual.sex as keyof typeof SEX_SYMBOL]}`}
										</p>
									</div>
								</div>
							</button>

							{/* Status */}
							<div
								className={`rounded-full px-2 py-1 text-xs font-semibold ${
									STATUS_COLORS[individual.status as keyof typeof STATUS_COLORS]
								}`}
							>
								{individual.status.charAt(0).toUpperCase() +
									individual.status.slice(1)}
							</div>

							{/* Actions */}
							<div className="flex gap-1">
								{onEditIndividual && (
									<button
										onClick={() => onEditIndividual(individual)}
										className="rounded px-2 py-1 text-xs hover:bg-gray-200"
									>
										Edit
									</button>
								)}
								{onDeleteIndividual && (
									<button
										onClick={() => handleDelete(individual)}
										disabled={deletingId === individual.id}
										className="rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50 disabled:opacity-50"
									>
										{deletingId === individual.id ? "..." : "Delete"}
									</button>
								)}
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
