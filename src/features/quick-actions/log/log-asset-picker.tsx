import { useState } from "react";
import { LoadingState } from "@/components/common/loading-state";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useListLivestockAssetsByFarmId } from "@/features/livestock/api/livestock-queries";
import type { LivestockAssetKind } from "@/features/livestock/types/livestock-types";

interface LogAssetPickerProps {
	farmId: string;
	value: string;
	onChange: (assetId: string) => void;
	assetKinds?: readonly LivestockAssetKind[];
	label?: string;
}

/**
 * Server-side searchable asset selector. Search and the optional single-kind
 * filter are pushed to the backend (`q`/`kind`) — never filtered in memory.
 */
export function LogAssetPicker({
	farmId,
	value,
	onChange,
	assetKinds,
	label = "Activo",
}: LogAssetPickerProps) {
	const [search, setSearch] = useState("");
	const kind = assetKinds?.length === 1 ? assetKinds[0] : undefined;

	const assetsQuery = useListLivestockAssetsByFarmId({
		farmId,
		filters: { q: search || undefined, kind, page: 1, pageSize: 20 },
		enabled: !!farmId,
	});
	const assets = assetsQuery.data?.data ?? [];

	return (
		<div className="space-y-1.5">
			<Label htmlFor="log-asset-search">{label}</Label>
			<Input
				id="log-asset-search"
				placeholder="Buscar activo..."
				value={search}
				onChange={(event) => setSearch(event.target.value)}
			/>
			<Select
				value={value || undefined}
				onValueChange={onChange}
			>
				<SelectTrigger className="w-full">
					<SelectValue placeholder="Selecciona un activo" />
				</SelectTrigger>
				<SelectContent>
					{assets.map((asset) => (
						<SelectItem
							key={asset.id}
							value={String(asset.id)}
						>
							{asset.name}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
			{assetsQuery.isLoading ? (
				<LoadingState
					message="Cargando activos..."
					size="sm"
				/>
			) : assets.length === 0 ? (
				<p className="text-xs text-(--v2-ink-soft)">
					No se encontraron activos para registrar aqui.
				</p>
			) : null}
		</div>
	);
}
