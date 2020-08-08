import type { KVS, KVSOptions } from "@kvs/types";
import { JsonValue } from "./JSONValue";

type KVSStorageKey = string;
const getItem = <K extends KVSStorageKey>(storage: Storage, key: K) => {
    const item = storage.getItem(key);
    return item !== null ? JSON.parse(item) : undefined;
};
const hasItem = <K extends KVSStorageKey>(storage: Storage, key: K) => {
    return storage.getItem(key) !== null;
};
const setItem = <K extends KVSStorageKey, V extends JsonValue | undefined>(storage: Storage, key: K, value: V) => {
    // It is difference with IndexedDB implementation.
    // This behavior compatible with localStorage.
    if (value === undefined) {
        return deleteItem(storage, key);
    }
    return storage.setItem(key, JSON.stringify(value));
};
const clearItem = (storage: Storage, kvsVersionKey: string) => {
    const currentVersion: number | undefined = getItem(storage, kvsVersionKey);
    // clear all
    storage.clear();
    // set kvs version again
    if (currentVersion !== undefined) {
        setItem(storage, kvsVersionKey, currentVersion);
    }
};
const deleteItem = <K extends KVSStorageKey>(storage: Storage, key: K) => {
    try {
        storage.removeItem(key);
        return true;
    } catch {
        return false;
    }
};

function* createIterator<K extends KVSStorageKey, V extends JsonValue>(
    storage: Storage,
    kvsVersionKey: string
): Iterator<[K, V]> {
    for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (!key) {
            continue;
        }
        // skip meta key
        if (key === kvsVersionKey) {
            continue;
        }
        const value = getItem(storage, key);
        yield [key, value] as [K, V];
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
    const oldVersion = getItem(storage, kvsVersionKey);
    if (oldVersion === undefined) {
        setItem(storage, kvsVersionKey, DEFAULT_KVS_VERSION);
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
const createStore = <K extends KVSStorageKey, V extends JsonValue>({
    storage,
    kvsVersionKey
}: {
    storage: Storage;
    kvsVersionKey: string;
}) => {
    const store = {
        get(key: K): Promise<V | undefined> {
            return Promise.resolve().then(() => {
                return getItem(storage, key);
            });
        },
        has(key: K): Promise<boolean> {
            return Promise.resolve().then(() => {
                return hasItem(storage, key);
            });
        },
        set(key: K, value: V | undefined): Promise<KVS<K, V>> {
            return Promise.resolve()
                .then(() => {
                    return setItem(storage, key, value);
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
        delete(key: K): Promise<boolean> {
            return Promise.resolve().then(() => {
                return deleteItem(storage, key);
            });
        },
        [Symbol.asyncIterator](): AsyncIterator<[K, V]> {
            const iterator = createIterator<K, V>(storage, kvsVersionKey);
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
export type KvsStorage<K extends KVSStorageKey, V extends JsonValue> = KVS<K, V>;
export type KvsStorageOptions<K extends KVSStorageKey, V extends JsonValue> = KVSOptions<K, V> & {
    kvsVersionKey?: string;
    storage: Storage;
};
export const kvsStorage = async <K extends KVSStorageKey, V extends JsonValue>(
    options: KvsStorageOptions<K, V>
): Promise<KvsStorage<K, V>> => {
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
