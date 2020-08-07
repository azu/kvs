import type { KVS, KVSConstructor, KVSOptions } from "@kvs/types";

type IndexedDBKey = string;
const openDB = ({
    name,
    version,
    tableName,
    onUpgrade
}: {
    name: string;
    version: number;
    tableName: string;
    onUpgrade: ({ oldVersion, database }: { oldVersion: number; database: IDBDatabase }) => any;
}): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        const openRequest = indexedDB.open(name, version);
        openRequest.onupgradeneeded = function (event) {
            const oldVersion = event.oldVersion;
            const database = openRequest.result;
            try {
                database.createObjectStore(tableName);
            } catch (e) {
                reject(e);
            }
            // @ts-ignore
            event.target.transaction.oncomplete = () => {
                Promise.resolve(
                    onUpgrade({
                        oldVersion,
                        database
                    })
                ).then(() => {
                    return resolve(database);
                });
            };
        };
        openRequest.addEventListener("blocked", () => {
            console.log("blocked");
            reject(openRequest.error);
        });
        openRequest.onerror = function () {
            console.log("blocked");
            reject(openRequest.error);
        };
        openRequest.onsuccess = function () {
            const db = openRequest.result;
            resolve(db);
        };
    });
};
const getItem = <K extends IndexedDBKey, V>(database: IDBDatabase, tableName: string, key: K): Promise<V> => {
    return new Promise((resolve, reject) => {
        const transaction = database.transaction(tableName, "readonly");
        const objectStore = transaction.objectStore(tableName);
        const request = objectStore.get(key);
        request.onsuccess = () => {
            resolve(request.result ? request.result : null);
        };
        request.onerror = () => {
            reject(request.error);
        };
    });
};
const hasItem = async <K extends IndexedDBKey>(database: IDBDatabase, tableName: string, key: K): Promise<boolean> => {
    const value = await getItem(database, tableName, key);
    return value !== undefined;
};
const setItem = <K extends IndexedDBKey, V>(
    database: IDBDatabase,
    tableName: string,
    key: K,
    value: V
): Promise<void> => {
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
type IndexedDBOptions = {
    tableName?: string;
};
const createStore = <K extends IndexedDBKey, V>(database: IDBDatabase, tableName: string) => {
    const store = {
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
        __debug__database__: database
    };
    return store;
};
export const kvsIndexedDB: KVSConstructor<any, any> = async <K extends IndexedDBKey, V>(
    options: KVSOptions<K, V> & IndexedDBOptions
): Promise<KVS<K, V>> => {
    const { name, version, upgrade, ...indexDBOptions } = options;
    const tableName = indexDBOptions.tableName ?? "kvs";
    const database = await openDB({
        name,
        version,
        tableName,
        onUpgrade: ({ oldVersion, database }) => {
            if (!upgrade) {
                return;
            }
            return upgrade(createStore(database, tableName), oldVersion);
        }
    });
    return createStore(database, tableName);
};
