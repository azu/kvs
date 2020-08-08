import type { KVS, KVSOptions, StoreNames, StoreValue } from "@kvs/types";
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
export const clearItem = (storage: Storage, kvsVersionKey: string) => {
    // TODO: kvsVersionKey is special type
    const currentVersion: number | undefined = getItem<any>(storage, kvsVersionKey);
    // clear all
    storage.clear();
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
const openStorage = async ({
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
    const oldVersion = getItem<any>(storage, kvsVersionKey);
    if (oldVersion === undefined) {
        setItem<any>(storage, kvsVersionKey, DEFAULT_KVS_VERSION);
    }
    // if user set newVersion, upgrade it
    if (oldVersion !== version) {
        return Promise.resolve(
            onUpgrade({
                oldVersion,
                newVersion: version,
                storage
            })
        ).then(() => {
            return storage;
        });
    }
    return storage;
};
const createStore = <Schema extends StorageSchema>({
    storage,
    kvsVersionKey
}: {
    storage: Storage;
    kvsVersionKey: string;
}) => {
    const store: KvsStorage<Schema> = {
        get<K extends StoreNames<Schema>>(key: K): Promise<StoreValue<Schema, K> | undefined> {
            return Promise.resolve().then(() => {
                return getItem<Schema>(storage, key);
            });
        },
        has(key: StoreNames<Schema>): Promise<boolean> {
            return Promise.resolve().then(() => {
                return hasItem<Schema>(storage, key);
            });
        },
        set<K extends StoreNames<Schema>>(key: K, value: StoreValue<Schema, K> | undefined) {
            return Promise.resolve()
                .then(() => {
                    return setItem<Schema>(storage, key, value);
                })
                .then(() => {
                    return store;
                });
        },
        clear(): Promise<void> {
            return Promise.resolve().then(() => {
                return clearItem(storage, kvsVersionKey);
            });
        },
        delete(key: StoreNames<Schema>): Promise<boolean> {
            return Promise.resolve().then(() => {
                return deleteItem<Schema>(storage, key);
            });
        },
        close(): Promise<void> {
            // Noop function
            return Promise.resolve();
        },
        [Symbol.asyncIterator](): AsyncIterator<[StoreNames<Schema>, StoreValue<Schema, StoreNames<Schema>>]> {
            const iterator = createIterator<Schema>(storage, kvsVersionKey);
            return {
                next() {
                    return Promise.resolve().then(() => {
                        return iterator.next();
                    });
                }
            };
        }
    };
    return store;
};
export type StorageSchema = {
    [index: string]: JsonValue;
};
export type KvsStorage<Schema extends StorageSchema> = KVS<Schema>;
export type KvsStorageOptions<Schema extends StorageSchema> = KVSOptions<Schema> & {
    kvsVersionKey?: string;
    storage: Storage;
};
export const kvsStorage = async <Schema extends StorageSchema>(
    options: KvsStorageOptions<Schema>
): Promise<KvsStorage<Schema>> => {
    const { name, version, upgrade, ...kvStorageOptions } = options;
    const kvsVersionKey = kvStorageOptions.kvsVersionKey ?? "__kvs_version__";
    const storage = await openStorage({
        storage: options.storage,
        version: options.version,
        onUpgrade: ({ oldVersion, newVersion, storage }) => {
            if (!options.upgrade) {
                return;
            }
            return options.upgrade({
                kvs: createStore({ storage, kvsVersionKey }),
                newVersion,
                oldVersion
            });
        },
        kvsVersionKey
    });
    return createStore({ storage, kvsVersionKey });
};
