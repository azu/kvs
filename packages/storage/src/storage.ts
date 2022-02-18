import type { KVS, KVSOptions, StoreNames, StoreValue } from "@kvs/types";
import { JsonValue } from "./JSONValue";

const TABLE_KEY_MARKER = ".__.";
export type KVSStorageKey = string;
export const getItem = <Schema extends StorageSchema>(storage: Storage, tableName: string, key: StoreNames<Schema>) => {
    const storageKey = `${tableName}${TABLE_KEY_MARKER}${String(key)}`;
    const item = storage.getItem(storageKey);
    return item !== null ? JSON.parse(item) : undefined;
};
export const hasItem = <Schema extends StorageSchema>(storage: Storage, tableName: string, key: StoreNames<Schema>) => {
    const storageKey = `${tableName}${TABLE_KEY_MARKER}${String(key)}`;
    return storage.getItem(storageKey) !== null;
};
export const setItem = <Schema extends StorageSchema>(
    storage: Storage,
    tableName: string,
    key: StoreNames<Schema>,
    value: StoreValue<Schema, StoreNames<Schema>> | undefined
) => {
    // It is difference with IndexedDB implementation.
    // This behavior compatible with localStorage.
    if (value === undefined) {
        return deleteItem(storage, tableName, key);
    }
    const storageKey = `${tableName}${TABLE_KEY_MARKER}${String(key)}`;
    return storage.setItem(storageKey, JSON.stringify(value));
};
export const clearItem = (storage: Storage, tableName: string, kvsVersionKey: string, options: { force: boolean }) => {
    // TODO: kvsVersionKey is special type
    const currentVersion: number | undefined = getItem<any>(storage, tableName, kvsVersionKey);
    // clear all
    storage.clear();
    // if option.force is true, does not restore metadata.
    if (options.force) {
        return;
    }
    // set kvs version again
    if (currentVersion !== undefined) {
        setItem<any>(storage, tableName, kvsVersionKey, currentVersion);
    }
};
export const deleteItem = <Schema extends StorageSchema>(
    storage: Storage,
    tableName: string,
    key: StoreNames<Schema>
): boolean => {
    const storageKey = `${tableName}${TABLE_KEY_MARKER}${String(key)}`;
    try {
        storage.removeItem(storageKey);
        return true;
    } catch {
        return false;
    }
};

export function* createIterator<Schema extends StorageSchema>(
    storage: Storage,
    tableName: string,
    kvsVersionKey: string
): Iterator<[StoreNames<Schema>, StoreValue<Schema, StoreNames<Schema>>]> {
    const tableKeyPrefix = `${tableName}${TABLE_KEY_MARKER}`;
    for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i) as StoreNames<Schema> | undefined;
        if (!key) {
            continue;
        }
        // skip another storage
        if (!key.startsWith(tableKeyPrefix)) {
            continue;
        }
        // skip meta key
        const keyWithoutPrefix = key.replace(tableKeyPrefix, "");
        if (keyWithoutPrefix === kvsVersionKey) {
            continue;
        }
        const value = getItem(storage, tableName, keyWithoutPrefix);
        yield [keyWithoutPrefix as StoreNames<Schema>, value];
    }
}

const DEFAULT_KVS_VERSION = 1;
const openStorage = async ({
    storage,
    version,
    tableName,
    kvsVersionKey,
    onUpgrade
}: {
    storage: Storage;
    version: number;
    tableName: string;
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
    let oldVersion = getItem<any>(storage, tableName, kvsVersionKey);
    if (oldVersion === undefined) {
        setItem<any>(storage, tableName, kvsVersionKey, DEFAULT_KVS_VERSION);
        // first `oldVersion` is `0`
        // https://github.com/azu/kvs/issues/8
        oldVersion = 0;
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
    tableName,
    storage,
    kvsVersionKey
}: {
    tableName: string;
    storage: Storage;
    kvsVersionKey: string;
}) => {
    const store: KvsStorage<Schema> = {
        get<K extends StoreNames<Schema>>(key: K): Promise<StoreValue<Schema, K> | undefined> {
            return Promise.resolve().then(() => {
                return getItem<Schema>(storage, tableName, key);
            });
        },
        has(key: StoreNames<Schema>): Promise<boolean> {
            return Promise.resolve().then(() => {
                return hasItem<Schema>(storage, tableName, key);
            });
        },
        set<K extends StoreNames<Schema>>(key: K, value: StoreValue<Schema, K> | undefined) {
            return Promise.resolve()
                .then(() => {
                    return setItem<Schema>(storage, tableName, key, value);
                })
                .then(() => {
                    return store;
                });
        },
        clear(): Promise<void> {
            return Promise.resolve().then(() => {
                return clearItem(storage, tableName, kvsVersionKey, { force: false });
            });
        },
        delete(key: StoreNames<Schema>): Promise<boolean> {
            return Promise.resolve().then(() => {
                return deleteItem<Schema>(storage, tableName, key);
            });
        },
        dropInstance(): Promise<void> {
            return Promise.resolve().then(() => {
                return clearItem(storage, tableName, kvsVersionKey, { force: true });
            });
        },
        close(): Promise<void> {
            // Noop function
            return Promise.resolve();
        },
        [Symbol.asyncIterator](): AsyncIterator<[StoreNames<Schema>, StoreValue<Schema, StoreNames<Schema>>]> {
            const iterator = createIterator<Schema>(storage, tableName, kvsVersionKey);
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
        tableName: name,
        onUpgrade: ({ oldVersion, newVersion, storage }) => {
            if (!options.upgrade) {
                return;
            }
            return options.upgrade({
                kvs: createStore({ tableName: name, storage, kvsVersionKey }),
                oldVersion,
                newVersion
            });
        },
        kvsVersionKey
    });
    return createStore({ tableName: name, storage, kvsVersionKey });
};
