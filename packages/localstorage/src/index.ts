import { JsonValue, KvsStorage, kvsStorage } from "@kvs/storage";
import { KVS, KVSOptions } from "@kvs/types";

export type KvsLocalStorageSchema = {
    [index: string]: JsonValue;
};
export type KvsLocalStorage<Schema extends KvsLocalStorageSchema> = KVS<Schema>;
export type KvsLocalStorageOptions<Schema extends KvsLocalStorageSchema> = KVSOptions<Schema> & {
    kvsVersionKey?: string;
};
export const kvsLocalStorage = async <Schema extends KvsLocalStorageSchema>(
    options: KvsLocalStorageOptions<Schema>
): Promise<KvsStorage<Schema>> => {
    return kvsStorage({
        ...options,
        storage: window.localStorage
    });
};
