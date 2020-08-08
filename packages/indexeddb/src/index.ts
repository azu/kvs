import type { KVS, KVSOptions } from "@kvs/types";

type IndexedDBKey = string;
const debug = {
    enabled: false,
    log(...args: any[]) {
        if (!debug.enabled) {
            return;
        }
        console.log(...args);
    }
};
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
            const oldVersion = event.oldVersion;
            const newVersion = event.newVersion ?? version;
            const database = openRequest.result;
            try {
                // create table at first time
                if (!newVersion || newVersion <= 1) {
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
            // @ts-ignore
            event.target.transaction.oncomplete = () => {
                Promise.resolve(
                    onUpgrade({
                        oldVersion,
                        newVersion,
                        database
                    })
                ).then(() => {
                    return resolve(database);
                });
            };
        };
        openRequest.addEventListener("blocked", () => {
            reject(openRequest.error);
        });
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
        request.addEventListener("upgradeneeded", (event) => {
            event.preventDefault();
            resolve();
        });
        request.addEventListener("blocked", () => {
            debug.log("dropInstance:blocked", request);
            reject(request.error);
        });
        request.onerror = function () {
            debug.log("dropInstance:error", request);
            reject(request.error);
        };
        request.onsuccess = function () {
            resolve();
        };
    });
};

const getItem = <K extends IndexedDBKey, V>(database: IDBDatabase, tableName: string, key: K): Promise<V> => {
    return new Promise((resolve, reject) => {
        const transaction = database.transaction(tableName, "readonly");
        const objectStore = transaction.objectStore(tableName);
        const request = objectStore.get(key);
        request.onsuccess = () => {
            resolve(request.result);
        };
        request.onerror = () => {
            reject(request.error);
        };
    });
};
const hasItem = async <K extends IndexedDBKey>(database: IDBDatabase, tableName: string, key: K): Promise<boolean> => {
    return new Promise((resolve, reject) => {
        const transaction = database.transaction(tableName, "readonly");
        const objectStore = transaction.objectStore(tableName);
        const request = objectStore.count(key);
        request.onsuccess = () => {
            resolve(request.result !== 0);
        };
        request.onerror = () => {
            reject(request.error);
        };
    });
};
const setItem = async <K extends IndexedDBKey, V>(
    database: IDBDatabase,
    tableName: string,
    key: K,
    value: V
): Promise<void> => {
    // If the value is undefined, delete the key
    // This behavior aim to align localStorage implementation
    if (value === undefined) {
        await deleteItem(database, tableName, key);
        return;
    }
    return new Promise((resolve, reject) => {
        const transaction = database.transaction(tableName, "readwrite");
        const objectStore = transaction.objectStore(tableName);
        const request = objectStore.put(value, key);
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
const deleteItem = async <K extends IndexedDBKey>(
    database: IDBDatabase,
    tableName: string,
    key: K
): Promise<boolean> => {
    return new Promise((resolve, reject) => {
        const transaction = database.transaction(tableName, "readwrite");
        const objectStore = transaction.objectStore(tableName);
        const request = objectStore.delete(key);
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
const iterator = <K extends IndexedDBKey, V>(database: IDBDatabase, tableName: string): AsyncIterator<[K, V]> => {
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
    debug?: boolean;
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

const createStore = <K extends IndexedDBKey, V>({
    database,
    databaseName,
    tableName
}: StoreOptions): KVSIndexedDB<K, V> => {
    const store: KVSIndexedDB<K, V> = {
        delete(key: K): Promise<boolean> {
            return deleteItem(database, tableName, key).then(() => true);
        },
        get(key: K): Promise<V | undefined> {
            return getItem(database, tableName, key);
        },
        has(key: K): Promise<boolean> {
            return hasItem(database, tableName, key);
        },
        set(key: K, value: V) {
            return setItem(database, tableName, key, value).then(() => store);
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

export type KVSIndexedDB<K extends IndexedDBKey, V> = KVS<K, V> & IndexedDBResults;
export type KvsIndexedDBOptions<K extends IndexedDBKey, V> = KVSOptions<K, V> & IndexedDBOptions;
export const kvsIndexedDB = async <K extends IndexedDBKey, V>(
    options: KvsIndexedDBOptions<K, V>
): Promise<KVSIndexedDB<K, V>> => {
    const { name, version, upgrade, ...indexDBOptions } = options;
    if (indexDBOptions.debug) {
        debug.enabled = indexDBOptions.debug;
    }
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
