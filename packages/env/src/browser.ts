import { KvsStorage } from "@kvs/storage";
import { kvsIndexedDB, KvsIndexedDBOptions } from "@kvs/indexeddb";
import { KvsEnvStorageOptions, KvsEnvStorageSchema } from "./share";

export const kvsEnvStorage = async <Schema extends KvsEnvStorageSchema>(
    options: KvsEnvStorageOptions<Schema> & KvsIndexedDBOptions<Schema>
): Promise<KvsStorage<Schema>> => {
    return kvsIndexedDB(options);
};
