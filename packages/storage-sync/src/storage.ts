import type { KVSSync, KVSSyncOptions, StoreNames, StoreValue } from "@kvs/types";
import { JsonValue } from "./JSONValue";

export type KVSStorageKey = string;
export const getItem = <Schema extends StorageSchema>(storage: Storage, key: StoreNames<Schema>) => {
    const item = storage.getItem(String(key));
    return item !== null ? JSON.parse(item) : undefined;
};
export const hasItem = <Schema extends StorageSchema>(storage: Storage, key: StoreNames<Schema>) => {
    return storage.getItem(String(key)) !== null;
};
export const setItem = <Schema extends StorageSchema>(
    storage: Storage,
    key: StoreNames<Schema>,
    value: StoreValue<Schema, StoreNames<Schema>> | undefined
) => {
    // It is difference with IndexedDB implementation.
    // This behavior compatible with localStorage.
    if (value === undefined) {
        return deleteItem(storage, key);
    }
    return storage.setItem(String(key), JSON.stringify(value));
};
export const clearItem = (storage: Storage, kvsVersionKey: string, options: { force: boolean }) => {
    // TODO: kvsVersionKey is special type
    const currentVersion: number | undefined = getItem<any>(storage, kvsVersionKey);
    // clear all
    storage.clear();
    // if option.force is true, does not restore metadata.
    if (options.force) {
        return;
    }
    // set kvs version again
    if (currentVersion !== undefined) {
        setItem<any>(storage, kvsVersionKey, currentVersion);
    }
};
export const deleteItem = <Schema extends StorageSchema>(storage: Storage, key: StoreNames<Schema>): boolean => {
    try {
        storage.removeItem(String(key));
        return true;
    } catch {
        return false;
    }
};

export function* createIterator<Schema extends StorageSchema>(
    storage: Storage,
    kvsVersionKey: string
): Iterator<[StoreNames<Schema>, StoreValue<Schema, StoreNames<Schema>>]> {
    for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i) as StoreNames<Schema> | undefined;
        if (!key) {
            continue;
        }
        // skip meta key
        if (key === kvsVersionKey) {
            continue;
        }
        const value = getItem(storage, key);
        yield [key, value];
    }
}

const DEFAULT_KVS_VERSION = 1;
const openStorage = ({
    storage,
    version,
    kvsVersionKey,
    onUpgrade
}: {
    storage: Storage;
    version: number;
    kvsVersionKey: string;
    onUpgrade: ({
        oldVersion,
        newVersion,
        storage
    }: {
        oldVersion: number;
        newVersion: number;
        storage: Storage;
    }) => any;
}) => {
    // kvsVersionKey is special type
    // first `oldVersion` is `0`
    let oldVersion = getItem<any>(storage, kvsVersionKey);
    if (oldVersion === undefined) {
        setItem<any>(storage, kvsVersionKey, DEFAULT_KVS_VERSION);
        // first `oldVersion` is `0`
        // https://github.com/azu/kvs/issues/8
        oldVersion = 0;
    }
    // if user set newVersion, upgrade it
    if (oldVersion !== version) {
        onUpgrade({
            oldVersion,
            newVersion: version,
            storage
        });
        return storage;
    }
    return storage;
};

const createStore = <Schema extends StorageSchema>({
    storage,
    kvsVersionKey
}: {
    storage: Storage;
    kvsVersionKey: string;
}): KvsStorageSync<Schema> => {
    const store: KvsStorageSync<Schema> = {
        get<K extends StoreNames<Schema>>(key: K): StoreValue<Schema, K> | undefined {
            return getItem<Schema>(storage, key);
        },
        has(key: StoreNames<Schema>): boolean {
            return hasItem<Schema>(storage, key);
        },
        set<K extends StoreNames<Schema>>(key: K, value: StoreValue<Schema, K> | undefined) {
            setItem<Schema>(storage, key, value);
            return store;
        },
        clear(): void {
            return clearItem(storage, kvsVersionKey, { force: false });
        },
        delete(key: StoreNames<Schema>): boolean {
            return deleteItem<Schema>(storage, key);
        },
        dropInstance(): void {
            return clearItem(storage, kvsVersionKey, { force: true });
        },
        close(): void {
            // Noop function
            return;
        },
        [Symbol.iterator](): Iterator<[StoreNames<Schema>, StoreValue<Schema, StoreNames<Schema>>]> {
            const iterator = createIterator<Schema>(storage, kvsVersionKey);
            return {
                next() {
                    return iterator.next();
                }
            };
        }
    };
    return store;
};
export type StorageSchema = {
    [index: string]: JsonValue;
};
export type KvsStorageSync<Schema extends StorageSchema> = KVSSync<Schema>;
export type KvsStorageSyncOptions<Schema extends StorageSchema> = KVSSyncOptions<Schema> & {
    kvsVersionKey?: string;
    storage: Storage;
};
export const kvsStorageSync = <Schema extends StorageSchema>(
    options: KvsStorageSyncOptions<Schema>
): KvsStorageSync<Schema> => {
    const { name, version, upgrade, ...kvStorageOptions } = options;
    const kvsVersionKey = kvStorageOptions.kvsVersionKey ?? "__kvs_version__";
    const storage = openStorage({
        storage: options.storage,
        version: options.version,
        onUpgrade: ({ oldVersion, newVersion, storage }) => {
            if (!options.upgrade) {
                return;
            }
            return options.upgrade({
                kvs: createStore({ storage, kvsVersionKey }),
                oldVersion,
                newVersion
            });
        },
        kvsVersionKey
    });
    return createStore({ storage, kvsVersionKey });
};
