import { JsonValue, KvsStorage, kvsStorage, KVSStorageKey } from "@kvs/storage";
import { KVS, KVSOptions } from "@kvs/types";
// @ts-ignore
import localstorage from "localstorage-memory";

export type KvsLocalStorage<K extends KVSStorageKey, V extends JsonValue> = KVS<K, V>;
export type KvsLocalStorageOptions<K extends KVSStorageKey, V extends JsonValue> = KVSOptions<K, V> & {
    kvsVersionKey?: string;
};
export const kvsMemoryStorage = async <K extends KVSStorageKey, V extends JsonValue>(
    options: KvsLocalStorageOptions<K, V>
): Promise<KvsStorage<K, V>> => {
    return kvsStorage({
        ...options,
        storage: localstorage
    });
};
