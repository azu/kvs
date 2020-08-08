export type KVS<K, V> = {
    clear(): Promise<void>;
    delete(key: K): Promise<boolean>;
    get(key: K): Promise<V | undefined>;
    has(key: K): Promise<boolean>;
    set(key: K, value: V | undefined): Promise<KVS<K, V>>;
    /*
     * Close the KVS connection
     * DB-like KVS close the connection via this method
     * Of course, localStorage-like KVS implement do nothing. It is just noop function
     */
    close(): Promise<void>;
} & AsyncIterable<[K, V]>;
export type KVSOptions<K, V> = {
    name: string;
    version: number;
    upgrade?({ kvs, oldVersion, newVersion }: { kvs: KVS<K, V>; oldVersion: number; newVersion: number }): Promise<any>;
};
export type KVSConstructor<K, V> = (options: KVSOptions<K, V>) => Promise<KVS<K, V>>;
/**
 * Sync Version
 */
export type KVSSync<K, V> = {
    clear(): void;
    delete(key: K): boolean;
    get(key: K): V | undefined;
    has(key: K): boolean;
    set(key: K, value: V | undefined): KVSSync<K, V>;
    close(): void;
} & Iterable<[K, V]>;
export type KVSSyncOptions<K, V> = {
    name: string;
    version: number;
    upgrade?({ kvs, oldVersion, newVersion }: { kvs: KVS<K, V>; oldVersion: number; newVersion: number }): any;
};
