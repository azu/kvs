import { JsonValue, KvsStorage } from "@kvs/storage";
import { kvsLocalStorage } from "@kvs/node-localstorage";
import { KvsEnvStorageOptions } from "./share";

export const kvsEnvStorage = async <K extends string, V extends JsonValue>(
    options: KvsEnvStorageOptions<K, V>
): Promise<KvsStorage<K, V>> => {
    return kvsLocalStorage(options);
};
