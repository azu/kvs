import { kvsLocalStorage, KvsLocalStorage, KvsLocalStorageOptions } from "@kvs/node-localstorage";
import { KvsEnvStorageOptions } from "./share";
import { KVSIndexedSchema } from "@kvs/indexeddb/lib";

export const kvsEnvStorage = async <Schema extends KVSIndexedSchema>(
    options: KvsEnvStorageOptions<Schema> & KvsLocalStorageOptions<Schema>
): Promise<KvsLocalStorage<Schema>> => {
    return kvsLocalStorage(options);
};
