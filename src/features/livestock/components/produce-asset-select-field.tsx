import { useRef, useState } from "react";

import {
	EventCategorySelectField,
	type CreateEventCategoryInput,
} from "@/features/livestock/components/event-category-select-field";
import {
	useCreateEventCategoryByFarmId,
	useListEventCategoriesByFarmId,
} from "@/features/livestock/api/livestock-queries";
import type { ILivestockEventCategory } from "@/features/livestock/types/livestock-types";
import {
	findCategoryIdByPool,
	findPoolIdByCategory,
} from "@/features/livestock/utils/product-utils";

const NONE_OPTION_VALUE = "none";

interface ProduceAssetSelectFieldProps {
	farmId: string;
	/** Selected produce pool id as string, or "none". */
	value: string;
	onChange: (value: string) => void;
	label: string;
	helperText?: string;
	disabled?: boolean;
}

/**
 * Picks the product a producer harvests by default.
 *
 * The farmer picks a *product* (a production category), but `asset` stores the
 * default as a *pool* id, so this maps between the two in both directions. The
 * pool itself is never authored here — creating a product provisions it on the
 * backend, and `POST /assets` rejects `kind=produce` outright.
 */
export function ProduceAssetSelectField({
	farmId,
	value,
	onChange,
	label,
	helperText,
	disabled = false,
}: ProduceAssetSelectFieldProps) {
	// A just-created product, held until the invalidated list refetches. The ref
	// is what makes the mapping work: the field selects the new product in the
	// same tick it is created, before a state update could be read back.
	const createdRef = useRef<ILivestockEventCategory[]>([]);
	const [created, setCreated] = useState<ILivestockEventCategory[]>([]);

	const { data: fetched = [] } = useListEventCategoriesByFarmId({
		farmId,
		filters: { type: "production", archived: false, pageSize: 100 },
		enabled: !!farmId,
	});
	const createMutation = useCreateEventCategoryByFarmId();

	const categories = [
		...fetched,
		...created.filter((one) => !fetched.some((other) => other.id === one.id)),
	];

	const selectedCategoryId =
		value === NONE_OPTION_VALUE
			? ""
			: findCategoryIdByPool(categories, Number(value));

	const handleChange = (categoryId: string) => {
		const poolId =
			findPoolIdByCategory(categories, categoryId) ??
			findPoolIdByCategory(createdRef.current, categoryId);
		onChange(poolId == null ? NONE_OPTION_VALUE : String(poolId));
	};

	const handleCreate = async (input: CreateEventCategoryInput) => {
		const category = await createMutation.mutateAsync({ farmId, data: input });
		createdRef.current = [...createdRef.current, category];
		setCreated(createdRef.current);
		return category.id;
	};

	return (
		<EventCategorySelectField
			type="production"
			categories={categories}
			value={selectedCategoryId}
			onChange={handleChange}
			label={label}
			placeholder="Sin producto vinculado"
			allowNone
			noneLabel="Sin producto vinculado"
			newOptionLabel="Nuevo producto"
			helperText={helperText}
			disabled={disabled}
			onCreateEventCategory={handleCreate}
		/>
	);
}
