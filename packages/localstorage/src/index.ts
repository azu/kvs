import { JsonValue, KvsStorage, kvsStorage, KVSStorageKey, KvsStorageOptions } from "@kvs/storage";
import { KVS, KVSOptions } from "@kvs/types";

export type KvsLocalStorage<K extends KVSStorageKey, V extends JsonValue> = KVS<K, V>;
export type KvsLocalStorageOptions<K extends KVSStorageKey, V extends JsonValue> = KVSOptions<K, V> & {
    kvsVersionKey?: string;
};
export const kvsLocalStorage = async <K extends KVSStorageKey, V extends JsonValue>(
    options: KvsStorageOptions<K, V>
): Promise<KvsStorage<K, V>> => {
    return kvsStorage({
        ...options,
        storage: window.localStorage
    });
};
