import type { KVSSync, KVSSyncOptions, StoreNames, StoreValue } from "@kvs/types";
import { JsonValue } from "./JSONValue";

function invariant(condition: any, message: string): asserts condition {
    if (condition) {
        return;
    }
    throw new Error(message);
}

export type KVSStorageKey = string;
const TABLE_KEY_MARKER = ".__.";
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
    try {
        const storageKey = `${tableName}${TABLE_KEY_MARKER}${String(key)}`;
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
const openStorage = ({
    storage,
    tableName,
    version,
    kvsVersionKey,
    onUpgrade
}: {
    storage: Storage;
    tableName: string;
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
    let oldVersion = getItem<any>(storage, tableName, kvsVersionKey);
    if (oldVersion === undefined) {
        setItem<any>(storage, tableName, kvsVersionKey, DEFAULT_KVS_VERSION);
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
    tableName,
    kvsVersionKey
}: {
    storage: Storage;
    tableName: string;
    kvsVersionKey: string;
}): KvsStorageSync<Schema> => {
    const store: KvsStorageSync<Schema> = {
        get<K extends StoreNames<Schema>>(key: K): StoreValue<Schema, K> | undefined {
            return getItem<Schema>(storage, tableName, key);
        },
        has(key: StoreNames<Schema>): boolean {
            return hasItem<Schema>(storage, tableName, key);
        },
        set<K extends StoreNames<Schema>>(key: K, value: StoreValue<Schema, K> | undefined) {
            setItem<Schema>(storage, tableName, key, value);
            return store;
        },
        clear(): void {
            return clearItem(storage, tableName, kvsVersionKey, { force: false });
        },
        delete(key: StoreNames<Schema>): boolean {
            return deleteItem<Schema>(storage, tableName, key);
        },
        dropInstance(): void {
            return clearItem(storage, tableName, kvsVersionKey, { force: true });
        },
        close(): void {
            // Noop function
            return;
        },
        [Symbol.iterator](): Iterator<[StoreNames<Schema>, StoreValue<Schema, StoreNames<Schema>>]> {
            const iterator = createIterator<Schema>(storage, tableName, kvsVersionKey);
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
    invariant(typeof name === "string", "name should be string");
    invariant(name.length > 0, "name should not be empty");
    invariant(!name.includes(TABLE_KEY_MARKER), `name can not include ${TABLE_KEY_MARKER}. It is reserved in kvs.`);
    invariant(typeof version === "number", `version should be number`);
    const kvsVersionKey = kvStorageOptions.kvsVersionKey ?? "__kvs_version__";
    const storage = openStorage({
        tableName: name,
        storage: options.storage,
        version: options.version,
        onUpgrade: ({ oldVersion, newVersion, storage }) => {
            if (!options.upgrade) {
                return;
            }
            return options.upgrade({
                kvs: createStore({ storage, tableName: name, kvsVersionKey }),
                oldVersion,
                newVersion
            });
        },
        kvsVersionKey
    });
    return createStore({ storage, tableName: name, kvsVersionKey });
};
