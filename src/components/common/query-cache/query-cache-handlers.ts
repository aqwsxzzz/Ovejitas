// // /* eslint-disable @typescript-eslint/no-unused-vars */
// // /* eslint-disable max-nested-callbacks */
// // import type { APIResponse, APIPaginatedListResponse } from '@/lib/axios/types/axios';
// // import type { InfiniteData, QueryClient } from '@tanstack/react-query';

// // interface BaseEntity {
// // 	id: string;
// // }

// // interface BaseFilters {
// // 	[key: string]: any;
// // }

// // interface QueryKeyConfig<TFilter> {
// // 	baseKey: readonly string[]; // Like "users" or "priorities"
// // 	listKey: (entityId: string, filters?: TFilter) => readonly string[];
// // 	detailKey: (itemId: string) => readonly string[];
// // }

// // abstract class BasePaginatedCacheManager<
// // 	TEntity extends BaseEntity, // What type of thing are we managing? (Priority, Task, User, etc.)
// // 	TFilters extends BaseFilters, // How can we filter these things?
// // 	TUpdatePayload = any, // What data do we need to update one?
// // > {
// // 	public constructor(
// // 		protected queryClient: QueryClient,
// // 		protected queryKeys: QueryKeyConfig<TFilters>,
// // 	) {}

// // 	public updateCachesOnCreate(entityId: string, newItem: TEntity): void {
// // 		const allListKeys = this.getAllListQueryKeys(entityId);

// // 		allListKeys.forEach((queryKey) => {
// // 			// Get the filters for this specific cache
// // 			const filters = this.extractFiltersFromQueryKey(queryKey);

// // 			// Only add to lists where the item belongs
// // 			if (this.itemMatchesFilters(newItem, filters)) {
// // 				this.queryClient.setQueryData<InfiniteData<APIPaginatedListResponse<TEntity>>>(queryKey, (oldData) => {
// // 					if (!oldData?.pages[0]?.data?.list) return oldData;

// // 					return {
// // 						...oldData,
// // 						pages: [
// // 							{
// // 								...oldData.pages[0],
// // 								data: {
// // 									...oldData.pages[0].data,
// // 									list: [newItem, ...oldData.pages[0].data.list],
// // 								},
// // 							},
// // 							...oldData.pages.slice(1),
// // 						],
// // 					};
// // 				});
// // 			}
// // 		});
// // 	}

// // 	public updateCachesOnUpdate({
// // 		entityId,
// // 		itemId,
// // 		updatedItem,
// // 		originalPayload,
// // 		skipCacheUpdate = false,
// // 	}: {
// // 		entityId: string;
// // 		itemId: string;
// // 		updatedItem: TEntity;
// // 		originalPayload: TUpdatePayload;
// // 		skipCacheUpdate?: boolean;
// // 	}): void {
// // 		if (skipCacheUpdate) {
// // 			return;
// // 		}
// // 		const allListKeys = this.getAllListQueryKeys(entityId);

// // 		allListKeys.forEach((queryKey) => {
// // 			const filters = this.extractFiltersFromQueryKey(queryKey);

// // 			this.queryClient.setQueryData<InfiniteData<APIPaginatedListResponse<TEntity>>>(queryKey, (oldData) => {
// // 				if (!oldData?.pages[0]?.data?.list) return oldData;

// // 				return {
// // 					...oldData,
// // 					pages: oldData.pages.map((page) => ({
// // 						...page,
// // 						data: {
// // 							...page.data,
// // 							list: page.data.list
// // 								.map((item) => {
// // 									if (item.id === itemId) {
// // 										// This is the item we updated
// // 										return updatedItem;
// // 									}

// // 									// Check if other items need to change (cascading)
// // 									return this.handleCascadingUpdates({
// // 										item,
// // 										updatedItem,
// // 										payload: originalPayload,
// // 										entityId,
// // 										filters,
// // 									});
// // 								})
// // 								.filter((item) => {
// // 									// Remove items that no longer match this filter
// // 									return this.itemMatchesFilters(item, filters);
// // 								}),
// // 						},
// // 					})),
// // 				};
// // 			});
// // 		});

// // 		this.queryClient.setQueryData<APIResponse<TEntity>>(this.queryKeys.detailKey(itemId), (oldData) => {
// // 			if (oldData?.data) {
// // 				return {
// // 					...oldData,
// // 					data: updatedItem,
// // 				};
// // 			}
// // 		});
// // 	}

// // 	public updateCachesOnDelete(entityId: string, itemId: string): void {
// // 		const allListKeys = this.getAllListQueryKeys(entityId);

// // 		allListKeys.forEach((queryKey) => {
// // 			this.queryClient.setQueryData<InfiniteData<APIPaginatedListResponse<TEntity>>>(queryKey, (oldData) => {
// // 				if (!oldData?.pages[0]?.data?.list) return oldData;

// // 				return {
// // 					...oldData,
// // 					pages: oldData.pages.map((page) => ({
// // 						...page,
// // 						data: {
// // 							...page.data,
// // 							list: page.data.list.filter((item) => item.id !== itemId),
// // 						},
// // 					})),
// // 				};
// // 			});
// // 		});

// // 		this.queryClient.removeQueries({
// // 			queryKey: this.queryKeys.detailKey(itemId),
// // 		});
// // 	}

// // 	public invalidateAllCaches(entityId?: string): void {
// // 		if (entityId) {
// // 			this.queryClient.invalidateQueries({
// // 				queryKey: [...this.queryKeys.baseKey, 'list', entityId],
// // 			});
// // 		} else {
// // 			this.queryClient.invalidateQueries({
// // 				queryKey: this.queryKeys.baseKey,
// // 			});
// // 		}
// // 	}

// // 	public updateCacheDataList(queryKey: readonly string[], newData: TEntity[]): void {
// // 		this.queryClient.setQueryData<InfiniteData<APIPaginatedListResponse<TEntity>>>(queryKey, (oldData) => {
// // 			if (!oldData?.pages[0]?.data?.list) return oldData;

// // 			return {
// // 				...oldData,
// // 				pages: [
// // 					{
// // 						...oldData.pages[0],
// // 						data: {
// // 							...oldData.pages[0].data,
// // 							list: newData,
// // 						},
// // 					},
// // 					...oldData.pages.slice(1),
// // 				],
// // 			};
// // 		});
// // 	}

// // 	protected handleCascadingUpdates({
// // 		item,
// // 		updatedItem,
// // 		payload,
// // 		filters,
// // 		entityId,
// // 	}: {
// // 		entityId: string;
// // 		item: TEntity; // An item in the list
// // 		updatedItem: TEntity; // The item that just got updated
// // 		payload: TUpdatePayload; // What changes were made
// // 		filters?: TFilters; // What filter is this list using
// // 	}): TEntity {
// // 		// Default behavior is to return the item unchanged
// // 		// Subclasses can override this to implement cascading updates
// // 		return item;
// // 	}

// // 	protected getAllListQueryKeys(entityId: string): readonly string[][] {
// // 		const allQueries = this.queryClient
// // 			.getQueryCache()
// // 			.findAll({
// // 				predicate: (query) => {
// // 					const key = query.queryKey;
// // 					const baseKey = this.queryKeys.baseKey;

// // 					// Check if this is a list query for our entity type
// // 					const isListQuery =
// // 						Array.isArray(key) &&
// // 						key.length >= baseKey.length + 2 && // Must have at least baseKey + 'list' + entityId
// // 						key.slice(0, baseKey.length).join(',') === baseKey.join(',') && // Matches base key
// // 						key[baseKey.length] === 'list' && // Is a list query
// // 						key[baseKey.length + 1] === entityId; // Matches our entity ID

// // 					return isListQuery;
// // 				},
// // 			})
// // 			.map((query) => query.queryKey as readonly string[]);

// // 		// @ts-expect-error will work
// // 		return allQueries;
// // 	}

// // 	protected extractFiltersFromQueryKey(queryKey: readonly string[]): TFilters | undefined {
// // 		if (queryKey.length < 4) {
// // 			return undefined;
// // 		}

// // 		const filterElement = queryKey[queryKey.length - 1];

// // 		// Handle different filter storage formats
// // 		if (typeof filterElement === 'string') {
// // 			if (filterElement === '' || filterElement === 'null') {
// // 				return undefined;
// // 			}

// // 			try {
// // 				const parsed = JSON.parse(filterElement) as TFilters;

// // 				return parsed;
// // 			} catch (error) {
// // 				return undefined;
// // 			}
// // 		} else if (typeof filterElement === 'object' && filterElement !== null) {
// // 			return filterElement as TFilters;
// // 		}

// // 		return undefined;
// // 	}

// // 	protected abstract itemMatchesFilters(item: TEntity, filters?: TFilters): boolean;
// // }

// import type { QueryClient } from "@tanstack/react-query";

// export interface EntityCacheManagerConfig<
// 	TEntity,
// 	TFilters = unknown,
// 	TCount = unknown,
// > {
// 	entityKey: string;
// 	listKeyIndex: number;
// 	filterIndex?: number;
// 	countQueryKeyFn?: (entityId: string) => readonly unknown[];
// 	filterMatcher: (item: TEntity, filters?: TFilters) => boolean;
// 	getId: (item: TEntity) => string;
// 	getList: (cacheData: unknown) => TEntity[] | undefined;
// 	setList: (cacheData: unknown, newList: TEntity[]) => unknown;
// }

// export class EntityCacheManager<TEntity, TFilters = unknown, TCount = unknown> {
// 	private queryClient: QueryClient;
// 	private config: EntityCacheManagerConfig<TEntity, TFilters, TCount>;

// 	constructor(
// 		queryClient: QueryClient,
// 		config: EntityCacheManagerConfig<TEntity, TFilters, TCount>,
// 	) {
// 		this.queryClient = queryClient;
// 		this.config = config;
// 	}

// 	private getAllListQueryKeys(
// 		entityId: string,
// 	): readonly (readonly unknown[])[] {
// 		const { entityKey, listKeyIndex } = this.config;
// 		return this.queryClient
// 			.getQueryCache()
// 			.findAll({
// 				predicate: (query) => {
// 					const key = query.queryKey;
// 					return (
// 						Array.isArray(key) &&
// 						key.length > listKeyIndex &&
// 						key[0] === entityKey &&
// 						key[1] === "list" &&
// 						key[listKeyIndex] === entityId
// 					);
// 				},
// 			})
// 			.map((query) => query.queryKey as readonly unknown[]);
// 	}

// 	updateAllEntityListsOnCreate(entityId: string, newItem: TEntity): void {
// 		const allListKeys = this.getAllListQueryKeys(entityId);
// 		allListKeys.forEach((queryKey) => {
// 			const filters =
// 				this.config.filterIndex !== undefined &&
// 				queryKey.length > this.config.filterIndex
// 					? (queryKey[this.config.filterIndex] as TFilters)
// 					: undefined;
// 			if (this.config.filterMatcher(newItem, filters)) {
// 				this.queryClient.setQueryData(queryKey, (oldData: unknown) => {
// 					const oldList = this.config.getList(oldData);
// 					if (!oldList) return oldData;
// 					const newList = [newItem, ...oldList];
// 					return this.config.setList(oldData, newList);
// 				});
// 			}
// 		});
// 	}

// 	invalidateAllEntityLists(entityId: string): void {
// 		const { entityKey } = this.config;
// 		this.queryClient.invalidateQueries({
// 			queryKey: [entityKey, "list", entityId],
// 		});
// 	}

// 	invalidateCount(entityId: string): void {
// 		if (this.config.countQueryKeyFn) {
// 			this.queryClient.invalidateQueries({
// 				queryKey: this.config.countQueryKeyFn(entityId),
// 			});
// 		}
// 	}

// 	updateCountCache(
// 		entityId: string,
// 		countUpdater: (oldCountData: TCount | undefined) => TCount,
// 	): void {
// 		if (this.config.countQueryKeyFn) {
// 			const countKey = this.config.countQueryKeyFn(entityId);
// 			this.queryClient.setQueryData<TCount>(countKey, countUpdater);
// 		}
// 	}

// 	handleCreate(entityId: string, newItem: TEntity): void {
// 		this.updateAllEntityListsOnCreate(entityId, newItem);
// 		this.invalidateCount(entityId);
// 	}

// 	handleBulkCreate(entityId: string): void {
// 		this.invalidateAllEntityLists(entityId);
// 		this.invalidateCount(entityId);
// 	}

// 	handleDelete(entityId: string, itemId: string): void {
// 		const allListKeys = this.getAllListQueryKeys(entityId);
// 		allListKeys.forEach((queryKey) => {
// 			this.queryClient.setQueryData(queryKey, (oldData: unknown) => {
// 				const oldList = this.config.getList(oldData);
// 				if (!oldList) return oldData;
// 				const newList = oldList.filter(
// 					(item: TEntity) => this.config.getId(item) !== itemId,
// 				);
// 				return this.config.setList(oldData, newList);
// 			});
// 		});
// 		this.invalidateCount(entityId);
// 	}

// 	handleUpdate(params: {
// 		entityId: string;
// 		itemId: string;
// 		updatedItem: TEntity;
// 		originalPayload?: unknown;
// 	}): void {
// 		const { entityId, itemId, updatedItem } = params;
// 		const allListKeys = this.getAllListQueryKeys(entityId);
// 		allListKeys.forEach((queryKey) => {
// 			this.queryClient.setQueryData(queryKey, (oldData: unknown) => {
// 				const oldList = this.config.getList(oldData);
// 				if (!oldList) return oldData;
// 				const newList = oldList.map((item: TEntity) =>
// 					this.config.getId(item) === itemId ? updatedItem : item,
// 				);
// 				return this.config.setList(oldData, newList);
// 			});
// 		});
// 		this.invalidateCount(entityId);
// 	}
// }
