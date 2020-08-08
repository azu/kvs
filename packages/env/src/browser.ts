import { JsonValue, KvsStorage } from "@kvs/storage";
import { kvsIndexedDB } from "@kvs/indexeddb";
import { KvsEnvStorageOptions } from "./share";

export const kvsEnvStorage = async <K extends string, V extends JsonValue>(
    options: KvsEnvStorageOptions<K, V>
): Promise<KvsStorage<K, V>> => {
    return kvsIndexedDB(options);
};
