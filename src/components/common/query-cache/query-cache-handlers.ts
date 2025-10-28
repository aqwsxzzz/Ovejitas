// import { QueryClient } from "@tanstack/react-query";

// //type Entity = Record<string, unknown>;

// export function pushEntityToMatchingLists<
// 	T extends { id: string; farmId: string },
// >(queryClient: QueryClient, entityKey: string, newItem: T) {
// 	const allLists = queryClient.getQueryCache().findAll({
// 		predicate: (query) => {
// 			const key = query.queryKey;
// 			// Solo listas convencionales: [entityKey, "list", farmId, filters?]
// 			return Array.isArray(key) && key[0] === entityKey && key[1] === "list";
// 		},
// 	});

// 	for (const listQuery of allLists) {
// 		const key = listQuery.queryKey;

// 		// structure: [entityKey, "list", farmId, filters?]
// 		const farmId = key[2] as string;
// 		const filters = key[3];

// 		// 1️⃣ validar que pertenezca a la misma farm
// 		if (newItem.farmId !== farmId) continue;

// 		// 2️⃣ solo procesar si filters es undefined o un array (string[])
// 		if (filters !== undefined && !Array.isArray(filters)) continue;

// 		// 3️⃣ si hay filtros, todos deben coincidir
// 		const matches =
// 			!filters ||
// 			(Array.isArray(filters) &&
// 				filters.every((filterStr) => {
// 					const [filterKey, filterValue] = filterStr.split(":");
// 					return newItem[filterKey as keyof T] === filterValue;
// 				}));

// 		if (matches) {
// 			queryClient.setQueryData<T[]>(key, (old) => {
// 				if (!Array.isArray(old)) return [newItem];
// 				if (old.some((i) => i.id === newItem.id)) return old;
// 				return [...old, newItem];
// 			});
// 		}
// 	}
// }
