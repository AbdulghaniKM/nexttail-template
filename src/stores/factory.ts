import { create, type StateCreator } from 'zustand';
import { devtools } from 'zustand/middleware';
import { isDev } from '@/config/env';
import type { PaginatedResponse, PaginationMeta, QueryParams } from '@/types/resource.types';

const STALE_AFTER_MINUTES = 5;

function emptyPaginationMeta(): PaginationMeta {
  return {
    page: 1,
    perPage: 15,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  };
}

function hasExceededStaleThreshold(
  lastCompletedFetch: Date | null,
  staleAfterMinutes: number,
): boolean {
  if (!lastCompletedFetch) return true;
  return Date.now() - lastCompletedFetch.getTime() > staleAfterMinutes * 60_000;
}

function entityIdsMatch(storedIdentifier: unknown, requestedIdentifier: string | number): boolean {
  if (storedIdentifier === undefined || storedIdentifier === null) return false;
  return String(storedIdentifier) === String(requestedIdentifier);
}

function readEntityIdentifier(entity: object): unknown {
  return (entity as { id?: unknown }).id;
}

function messageFor(failure: unknown, fallback: string): string {
  return failure instanceof Error ? failure.message : fallback;
}

export interface ResourceCollectionClient<T> {
  findAll: (params?: QueryParams) => Promise<PaginatedResponse<T>>;
  findOne: (id: string | number) => Promise<T>;
  create: (draft: Partial<T>) => Promise<T>;
  update: (id: string | number, patch: Partial<T>) => Promise<T>;
  remove: (id: string | number) => Promise<void>;
}

export interface ResourceState<T> {
  items: T[];
  selected: T | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  pagination: PaginationMeta;
  queryParams: QueryParams;
  lastFetched: Date | null;
  isEmpty: () => boolean;
  isStale: () => boolean;
  fetchAll: (params?: QueryParams) => Promise<void>;
  fetchOne: (id: string | number) => Promise<void>;
  create: (draft: Partial<T>) => Promise<T>;
  update: (id: string | number, patch: Partial<T>) => Promise<T>;
  remove: (id: string | number) => Promise<void>;
  setQuery: (patch: Partial<QueryParams>) => void;
  nextPage: () => Promise<void>;
  prevPage: () => Promise<void>;
  findById: (id: string | number) => T | undefined;
  reset: () => void;
}

type ResourcePatch<T> =
  | Partial<ResourceState<T>>
  | ((state: ResourceState<T>) => Partial<ResourceState<T>>);

const initialResourceState = <T>() => ({
  items: [] as T[],
  selected: null as T | null,
  isLoading: false,
  isSaving: false,
  error: null as string | null,
  pagination: emptyPaginationMeta(),
  queryParams: { page: 1, perPage: 15 } as QueryParams,
  lastFetched: null as Date | null,
});

/**
 * Builds a Zustand store with the standard collection lifecycle (list, read,
 * create, update, delete, paginate) on top of any service that satisfies
 * `ResourceCollectionClient`. Pass `extend` to add domain-specific state.
 */
export function createResourceStore<T extends object, Extra extends object = Record<never, never>>(
  storeName: string,
  remoteCollection: ResourceCollectionClient<T>,
  extend?: StateCreator<ResourceState<T> & Extra, [], [], Extra>,
) {
  type Store = ResourceState<T> & Extra;

  const builder: StateCreator<Store> = (set, get, store) => {
    // The base lifecycle only ever writes its own slice; narrowing `set` here
    // keeps every call below free of per-call casts.
    const patch = set as unknown as (update: ResourcePatch<T>) => void;

    const isSelected = (selected: T | null, id: string | number): boolean =>
      selected !== null && entityIdsMatch(readEntityIdentifier(selected), id);

    const base: ResourceState<T> = {
      ...initialResourceState<T>(),

      isEmpty: () => get().items.length === 0,

      isStale: () => hasExceededStaleThreshold(get().lastFetched, STALE_AFTER_MINUTES),

      async fetchAll(params?: QueryParams) {
        patch({ isLoading: true, error: null });
        try {
          const mergedQueryParams = { ...get().queryParams, ...params };
          const collectionPage = await remoteCollection.findAll(mergedQueryParams);
          patch({
            queryParams: mergedQueryParams,
            items: collectionPage.data,
            pagination: collectionPage.meta,
            lastFetched: new Date(),
          });
        } catch (failure: unknown) {
          patch({ error: messageFor(failure, 'Failed to fetch') });
          throw failure;
        } finally {
          patch({ isLoading: false });
        }
      },

      async fetchOne(id: string | number) {
        patch({ isLoading: true, error: null });
        try {
          const loadedEntity = await remoteCollection.findOne(id);
          patch((state) => ({
            selected: loadedEntity,
            items: state.items.map((item) =>
              entityIdsMatch(readEntityIdentifier(item), id) ? loadedEntity : item,
            ),
          }));
        } catch (failure: unknown) {
          patch({ error: messageFor(failure, 'Failed to load') });
          throw failure;
        } finally {
          patch({ isLoading: false });
        }
      },

      async create(draft: Partial<T>) {
        patch({ isSaving: true, error: null });
        try {
          const createdEntity = await remoteCollection.create(draft);
          patch((state) => ({ items: [createdEntity, ...state.items], selected: createdEntity }));
          return createdEntity;
        } catch (failure: unknown) {
          patch({ error: messageFor(failure, 'Failed to create') });
          throw failure;
        } finally {
          patch({ isSaving: false });
        }
      },

      async update(id: string | number, changes: Partial<T>) {
        patch({ isSaving: true, error: null });
        try {
          const updatedEntity = await remoteCollection.update(id, changes);
          patch((state) => ({
            items: state.items.map((item) =>
              entityIdsMatch(readEntityIdentifier(item), id) ? updatedEntity : item,
            ),
            selected: isSelected(state.selected, id) ? updatedEntity : state.selected,
          }));
          return updatedEntity;
        } catch (failure: unknown) {
          patch({ error: messageFor(failure, 'Failed to update') });
          throw failure;
        } finally {
          patch({ isSaving: false });
        }
      },

      async remove(id: string | number) {
        patch({ isSaving: true, error: null });
        try {
          await remoteCollection.remove(id);
          patch((state) => ({
            items: state.items.filter((item) => !entityIdsMatch(readEntityIdentifier(item), id)),
            selected: isSelected(state.selected, id) ? null : state.selected,
          }));
        } catch (failure: unknown) {
          patch({ error: messageFor(failure, 'Failed to delete') });
          throw failure;
        } finally {
          patch({ isSaving: false });
        }
      },

      setQuery(changes: Partial<QueryParams>) {
        patch((state) => ({ queryParams: { ...state.queryParams, ...changes } }));
      },

      async nextPage() {
        const { pagination, queryParams, fetchAll } = get();
        if (!pagination.hasNext) return;
        await fetchAll({ ...queryParams, page: pagination.page + 1 });
      },

      async prevPage() {
        const { pagination, queryParams, fetchAll } = get();
        if (!pagination.hasPrev) return;
        await fetchAll({ ...queryParams, page: Math.max(1, pagination.page - 1) });
      },

      findById(id: string | number) {
        return get().items.find((item) => entityIdsMatch(readEntityIdentifier(item), id));
      },

      reset() {
        patch(initialResourceState<T>());
      },
    };

    const customizedBindings = extend?.(set, get, store) ?? ({} as Extra);
    return { ...(base as Store), ...customizedBindings };
  };

  return create<Store>()(devtools(builder, { name: storeName, enabled: isDev() }));
}
