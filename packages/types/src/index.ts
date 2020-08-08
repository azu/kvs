export type KVS<K, V> = {
    clear(): Promise<void>;
    delete(key: K): Promise<boolean>;
    get(key: K): Promise<V | undefined>;
    has(key: K): Promise<boolean>;
    set(key: K, value: V): Promise<KVS<K, V>>;
} & AsyncIterable<[K, V]>;
export type KVSOptions<K, V> = {
    name: string;
    version: number;
    upgrade?(kvs: KVS<K, V>, oldVersion: number): Promise<void>;
};
export type KVSConstructor<K, V> = (options: KVSOptions<K, V>) => Promise<KVS<K, V>>;
