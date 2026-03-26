import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { libraryRepository } from "@/lib/storage/repositories";
import type { LibraryItem, LibraryItemType } from "@/lib/storage/types";

type CreateLibraryItemInput = {
  title: string;
  content: string;
  type: LibraryItemType;
};

type UpdateLibraryItemInput = Partial<CreateLibraryItemInput>;

type LibraryContextType = {
  items: LibraryItem[];
  isLoaded: boolean;
  createItem: (input: CreateLibraryItemInput) => Promise<LibraryItem>;
  updateItem: (id: string, input: UpdateLibraryItemInput) => Promise<LibraryItem | null>;
  deleteItem: (id: string) => Promise<void>;
  reloadItems: () => Promise<void>;
};

const LibraryContext = createContext<LibraryContextType | null>(null);

export function LibraryProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const hasLoadedRef = useRef(false);
  const loadPromiseRef = useRef<Promise<void> | null>(null);

  const loadItems = useCallback(async () => {
    if (loadPromiseRef.current) {
      return loadPromiseRef.current;
    }

    loadPromiseRef.current = (async () => {
      try {
        const storedItems = await libraryRepository.getAll();
        setItems(storedItems);
      } catch (error) {
        console.error("Failed to load library items.", error);
      } finally {
        hasLoadedRef.current = true;
        setIsLoaded(true);
      }
    })();

    return loadPromiseRef.current;
  }, []);

  const ensureLoaded = useCallback(async () => {
    if (hasLoadedRef.current) {
      return;
    }

    await (loadPromiseRef.current ?? loadItems());
  }, [loadItems]);

  const reloadItems = useCallback(async () => {
    try {
      const storedItems = await libraryRepository.getAll();
      setItems(storedItems);
    } catch (error) {
      console.error("Failed to load library items.", error);
    } finally {
      hasLoadedRef.current = true;
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    void loadItems();
  }, [loadItems]);

  const createItem = useCallback(async (input: CreateLibraryItemInput) => {
    await ensureLoaded();

    const now = Date.now();
    const nextItem: LibraryItem = {
      id: libraryRepository.createId(),
      title: input.title.trim(),
      content: input.content.trim(),
      type: input.type,
      createdAt: now,
      updatedAt: now,
    };

    await libraryRepository.create(nextItem);
    setItems((currentItems) => [nextItem, ...currentItems]);

    return nextItem;
  }, [ensureLoaded]);

  const updateItem = useCallback(
    async (id: string, input: UpdateLibraryItemInput) => {
      await ensureLoaded();

      const updatedItem = await libraryRepository.update(id, {
        ...(input.title !== undefined ? { title: input.title.trim() } : {}),
        ...(input.content !== undefined ? { content: input.content.trim() } : {}),
        ...(input.type !== undefined ? { type: input.type } : {}),
      });

      if (!updatedItem) {
        return null;
      }

      setItems((currentItems) => {
        const nextItems = currentItems
          .map((item) => (item.id === id ? updatedItem : item))
          .sort((left, right) => right.updatedAt - left.updatedAt);

        return nextItems;
      });

      return updatedItem;
    },
    [ensureLoaded],
  );

  const deleteItem = useCallback(async (id: string) => {
    await ensureLoaded();
    await libraryRepository.remove(id);
    setItems((currentItems) => currentItems.filter((item) => item.id !== id));
  }, [ensureLoaded]);

  const value = useMemo(
    () => ({
      items,
      isLoaded,
      createItem,
      updateItem,
      deleteItem,
      reloadItems,
    }),
    [createItem, deleteItem, isLoaded, items, reloadItems, updateItem],
  );

  return (
    <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>
  );
}

export function useLibrary() {
  const context = useContext(LibraryContext);

  if (!context) {
    throw new Error("useLibrary must be used within LibraryProvider");
  }

  return context;
}
