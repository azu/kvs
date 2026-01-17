import type { KVS, KVSOptions, StoreNames, StoreValue } from "@kvs/types";
import type { JsonValue } from "@kvs/storage";

function invariant(condition: any, message: string): asserts condition {
    if (condition) {
        return;
    }
    throw new Error(message);
}

const openDB = ({
    name,
    version,
    tableName,
    onUpgrade
}: {
    name: string;
    version: number;
    tableName: string;
    onUpgrade: ({
        oldVersion,
        newVersion,
        database
    }: {
        oldVersion: number;
        newVersion: number;
        database: IDBDatabase;
    }) => any;
}): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        const openRequest = indexedDB.open(name, version);
        openRequest.onupgradeneeded = function (event) {
            // IndexedDB has oldVersion and newVersion is native properties
            const oldVersion = event.oldVersion;
            const newVersion = event.newVersion ?? version;
            const database = openRequest.result;
            try {
                // create table at first time
                if (!newVersion || newVersion <= 1 || oldVersion === 0) {
                    database.createObjectStore(tableName);
                }
            } catch (e) {
                reject(e);
            }
            // for drop instance
            // https://github.com/w3c/IndexedDB/issues/78
            // https://www.w3.org/TR/IndexedDB/#introduction
            database.onversionchange = () => {
                database.close();
            };
            // @ts-expect-error: target should be existed
            event.target.transaction.oncomplete = async () => {
                try {
                    await onUpgrade({
                        oldVersion,
                        newVersion,
                        database
                    });
                    return resolve(database);
                } catch (error) {
                    return reject(error);
                }
            };
        };
        openRequest.onblocked = () => {
            reject(openRequest.error);
        };
        openRequest.onerror = function () {
            reject(openRequest.error);
        };
        openRequest.onsuccess = function () {
            const db = openRequest.result;
            resolve(db);
        };
    });
};

const dropInstance = (database: IDBDatabase, databaseName: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        database.close();
        const request = indexedDB.deleteDatabase(databaseName);
        request.onupgradeneeded = (event) => {
            event.preventDefault();
            resolve();
        };
        request.onblocked = () => {
            reject(request.error);
        };
        request.onerror = function () {
            reject(request.error);
        };
        request.onsuccess = function () {
            resolve();
        };
    });
};

const getItem = <Schema extends KVSIndexedSchema>(
    database: IDBDatabase,
    tableName: string,
    key: StoreNames<Schema>
): Promise<StoreValue<Schema, StoreNames<Schema>>> => {
    return new Promise((resolve, reject) => {
        const transaction = database.transaction(tableName, "readonly");
        const objectStore = transaction.objectStore(tableName);
        const request = objectStore.get(String(key));
        request.onsuccess = () => {
            resolve(request.result);
        };
        request.onerror = () => {
            reject(request.error);
        };
    });
};
const hasItem = async <Schema extends KVSIndexedSchema>(
    database: IDBDatabase,
    tableName: string,
    key: StoreNames<Schema>
): Promise<boolean> => {
    return new Promise((resolve, reject) => {
        const transaction = database.transaction(tableName, "readonly");
        const objectStore = transaction.objectStore(tableName);
        const request = objectStore.count(String(key));
        request.onsuccess = () => {
            resolve(request.result !== 0);
        };
        request.onerror = () => {
            reject(request.error);
        };
    });
};
const setItem = async <Schema extends KVSIndexedSchema>(
    database: IDBDatabase,
    tableName: string,
    key: StoreNames<Schema>,
    value: StoreValue<Schema, StoreNames<Schema>> | undefined
): Promise<void> => {
    // If the value is undefined, delete the key
    // This behavior aim to align localStorage implementation
    if (value === undefined) {
        await deleteItem<Schema>(database, tableName, key);
        return;
    }
    return new Promise((resolve, reject) => {
        const transaction = database.transaction(tableName, "readwrite");
        const objectStore = transaction.objectStore(tableName);
        const request = objectStore.put(value, String(key));
        transaction.oncomplete = () => {
            resolve();
        };
        transaction.onabort = () => {
            reject(request.error ? request.error : transaction.error);
        };
        transaction.onerror = () => {
            reject(request.error ? request.error : transaction.error);
        };
    });
};
const deleteItem = async <Schema extends KVSIndexedSchema>(
    database: IDBDatabase,
    tableName: string,
    key: StoreNames<Schema>
): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
        const transaction = database.transaction(tableName, "readwrite");
        const objectStore = transaction.objectStore(tableName);
        const request = objectStore.delete(String(key));
        transaction.oncomplete = () => {
            resolve();
        };
        transaction.onabort = () => {
            reject(request.error ? request.error : transaction.error);
        };
        transaction.onerror = () => {
            reject(request.error ? request.error : transaction.error);
        };
    });
};
const clearItems = async (database: IDBDatabase, tableName: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        const transaction = database.transaction(tableName, "readwrite");
        const objectStore = transaction.objectStore(tableName);
        const request = objectStore.clear();
        transaction.oncomplete = () => {
            resolve();
        };
        transaction.onabort = () => {
            reject(request.error ? request.error : transaction.error);
        };
        transaction.onerror = () => {
            reject(request.error ? request.error : transaction.error);
        };
    });
};
const iterator = <Schema extends KVSIndexedSchema, K extends StoreNames<Schema>, V extends StoreValue<Schema, K>>(
    database: IDBDatabase,
    tableName: string
): AsyncIterator<[K, V]> => {
    const handleCursor = <T>(request: IDBRequest<T | null>): Promise<{ done: boolean; value?: T }> => {
        return new Promise((resolve, reject) => {
            request.onsuccess = () => {
                const cursor = request.result;
                if (!cursor) {
                    return resolve({
                        done: true
                    });
                }
                return resolve({
                    done: false,
                    value: cursor
                });
            };
            request.onerror = () => {
                reject(request.error);
            };
        });
    };
    const transaction = database.transaction(tableName, "readonly");
    const objectStore = transaction.objectStore(tableName);
    const request = objectStore.openCursor();
    return {
        async next() {
            const { done, value } = await handleCursor(request);
            if (!done) {
                const storageKey = value?.key as K;
                const storageValue = value?.value as V;
                value?.continue();
                return { done: false, value: [storageKey, storageValue] };
            }
            return { done: true, value: undefined };
        }
    };
};

type IndexedDBOptions = {
    tableName?: string;
};
type IndexedDBResults = {
    dropInstance(): Promise<void>;
    __debug__database__: IDBDatabase;
};

interface StoreOptions {
    database: IDBDatabase;
    databaseName: string;
    tableName: string;
}

const createStore = <Schema extends KVSIndexedSchema>({
    database,
    databaseName,
    tableName
}: StoreOptions): KVSIndexedDB<Schema> => {
    const store: KVSIndexedDB<Schema> = {
        delete(key: StoreNames<Schema>): Promise<boolean> {
            return deleteItem<Schema>(database, tableName, key).then(() => true);
        },
        get<K extends StoreNames<Schema>>(key: K): Promise<StoreValue<Schema, K> | undefined> {
            return getItem<Schema>(database, tableName, key);
        },
        has(key: StoreNames<Schema>): Promise<boolean> {
            return hasItem(database, tableName, key);
        },
        set<K extends StoreNames<Schema>>(key: K, value: StoreValue<Schema, K>) {
            return setItem<Schema>(database, tableName, key, value).then(() => store);
        },
        clear(): Promise<void> {
            return clearItems(database, tableName);
        },
        dropInstance(): Promise<void> {
            return dropInstance(database, databaseName);
        },
        close() {
            return Promise.resolve().then(() => {
                database.close();
            });
        },
        [Symbol.asyncIterator]() {
            return iterator(database, tableName);
        },
        __debug__database__: database
    };
    return store;
};

export type KVSIndexedSchema = {
    [index: string]: JsonValue;
};
export type KVSIndexedDB<Schema extends KVSIndexedSchema> = KVS<Schema> & IndexedDBResults;
export type KvsIndexedDBOptions<Schema extends KVSIndexedSchema> = KVSOptions<Schema> & IndexedDBOptions;
export const kvsIndexedDB = async <Schema extends KVSIndexedSchema>(
    options: KvsIndexedDBOptions<Schema>
): Promise<KVSIndexedDB<Schema>> => {
    const { name, version, upgrade, ...indexDBOptions } = options;
    invariant(typeof name === "string", "name should be string");
    invariant(typeof version === "number", "version should be number");
    const tableName = indexDBOptions.tableName ?? "kvs";
    const database = await openDB({
        name,
        version,
        tableName,
        onUpgrade: ({ oldVersion, newVersion, database }) => {
            if (!upgrade) {
                return;
            }
            return upgrade({
                kvs: createStore({ database: database, tableName: tableName, databaseName: name }),
                oldVersion,
                newVersion
            });
        }
    });
    return createStore({ database: database, tableName: tableName, databaseName: name });
};
