import { JsonValue, KvsStorage, kvsStorage } from "@kvs/storage";
import { KVS, KVSOptions } from "@kvs/types";
// @ts-ignore
import localstorage from "localstorage-memory";

export type KvsMemoryStorageSchema = {
    [index: string]: JsonValue;
};
export type KvsMemoryStorage<Schema extends KvsMemoryStorageSchema> = KVS<Schema>;
export type KvsMemoryStorageOptions<Schema extends KvsMemoryStorageSchema> = KVSOptions<Schema> & {
    kvsVersionKey?: string;
};
export const kvsMemoryStorage = async <Schema extends KvsMemoryStorageSchema>(
    options: KvsMemoryStorageOptions<Schema>
): Promise<KvsStorage<Schema>> => {
    return kvsStorage({
        ...options,
        storage: localstorage
    });
};
