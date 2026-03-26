import AsyncStorage from "@react-native-async-storage/async-storage";

import type { LibraryItem, RuntimeEndpoint } from "@/lib/storage/types";

export const SETTINGS_STORAGE_KEY = "persona:settings";
export const LIBRARY_STORAGE_KEY = "persona:library-items";
export const RUNTIME_ENDPOINTS_STORAGE_KEY = "persona:runtime-endpoints";

function sortByUpdatedAt<T extends { updatedAt: number }>(items: T[]) {
  return [...items].sort((left, right) => right.updatedAt - left.updatedAt);
}

function createEntityId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

async function readArray<T>(storageKey: string) {
  const raw = await AsyncStorage.getItem(storageKey);

  if (!raw) {
    return [] as T[];
  }

  const parsed = JSON.parse(raw) as T[];
  return Array.isArray(parsed) ? parsed : [];
}

async function writeArray<T>(storageKey: string, value: T[]) {
  await AsyncStorage.setItem(storageKey, JSON.stringify(value));
}

export const settingsRepository = {
  async load<T>() {
    const raw = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);

    if (!raw) {
      return null;
    }

    return JSON.parse(raw) as T;
  },

  async save<T>(value: T) {
    await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(value));
  },
};

export const libraryRepository = {
  createId() {
    return createEntityId("library");
  },

  async getAll() {
    const items = await readArray<LibraryItem>(LIBRARY_STORAGE_KEY);
    return sortByUpdatedAt(items);
  },

  async getById(id: string) {
    const items = await this.getAll();
    return items.find((item) => item.id === id);
  },

  async create(item: LibraryItem) {
    const items = await this.getAll();
    const nextItems = sortByUpdatedAt([item, ...items]);
    await writeArray(LIBRARY_STORAGE_KEY, nextItems);
    return item;
  },

  async update(id: string, changes: Partial<Omit<LibraryItem, "id" | "createdAt">>) {
    const items = await this.getAll();
    const updatedAt = Date.now();
    let updatedItem: LibraryItem | null = null;

    const nextItems = sortByUpdatedAt(
      items.map((item) => {
        if (item.id !== id) {
          return item;
        }

        updatedItem = {
          ...item,
          ...changes,
          updatedAt,
        };

        return updatedItem;
      }),
    );

    await writeArray(LIBRARY_STORAGE_KEY, nextItems);
    return updatedItem;
  },

  async remove(id: string) {
    const items = await this.getAll();
    const nextItems = items.filter((item) => item.id !== id);
    await writeArray(LIBRARY_STORAGE_KEY, nextItems);
  },

  async count() {
    const items = await this.getAll();
    return items.length;
  },
};

export const runtimeEndpointRepository = {
  createId() {
    return createEntityId("runtime");
  },

  async getAll() {
    const items = await readArray<RuntimeEndpoint>(RUNTIME_ENDPOINTS_STORAGE_KEY);
    return sortByUpdatedAt(items);
  },

  async getById(id: string) {
    const items = await this.getAll();
    return items.find((item) => item.id === id);
  },

  async create(item: RuntimeEndpoint) {
    const items = await this.getAll();
    const nextItems = sortByUpdatedAt([item, ...items]);
    await writeArray(RUNTIME_ENDPOINTS_STORAGE_KEY, nextItems);
    return item;
  },

  async update(
    id: string,
    changes: Partial<Omit<RuntimeEndpoint, "id" | "createdAt">>,
  ) {
    const items = await this.getAll();
    const updatedAt = Date.now();
    let updatedItem: RuntimeEndpoint | null = null;

    const nextItems = sortByUpdatedAt(
      items.map((item) => {
        if (item.id !== id) {
          return item;
        }

        updatedItem = {
          ...item,
          ...changes,
          updatedAt,
        };

        return updatedItem;
      }),
    );

    await writeArray(RUNTIME_ENDPOINTS_STORAGE_KEY, nextItems);
    return updatedItem;
  },

  async remove(id: string) {
    const items = await this.getAll();
    const nextItems = items.filter((item) => item.id !== id);
    await writeArray(RUNTIME_ENDPOINTS_STORAGE_KEY, nextItems);
  },

  async count() {
    const items = await this.getAll();
    return items.length;
  },
};
