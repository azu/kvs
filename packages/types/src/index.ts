export type KVS<K, V> = {
    clear(): Promise<void>;
    delete(key: K): Promise<boolean>;
    get(key: K): Promise<V | undefined>;
    has(key: K): Promise<boolean>;
    set(key: K, value: V | undefined): Promise<KVS<K, V>>;
} & AsyncIterable<[K, V]>;
export type KVSOptions<K, V> = {
    name: string;
    version: number;
    upgrade?({ kvs, oldVersion, newVersion }: { kvs: KVS<K, V>; oldVersion: number; newVersion: number }): Promise<any>;
};
export type KVSConstructor<K, V> = (options: KVSOptions<K, V>) => Promise<KVS<K, V>>;
