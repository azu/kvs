import path from "path";
import { JsonValue, KvsStorage, kvsStorage } from "@kvs/storage";
import { KVS, KVSOptions } from "@kvs/types";
// @ts-ignore
import { LocalStorage } from "node-localstorage";
// @ts-ignore
import appRoot from "app-root-path";
// @ts-ignore
import mkdirp from "mkdirp";

export type KvsLocalStorageSchema = {
    [index: string]: JsonValue;
};
export type KvsLocalStorage<Schema extends KvsLocalStorageSchema> = KVS<Schema>;
export type KvsLocalStorageOptions<Schema extends KvsLocalStorageSchema> = KVSOptions<Schema> & {
    kvsVersionKey?: string;
    storeFilePath?: string;
};
export const kvsLocalStorage = async <Schema extends KvsLocalStorageSchema>(
    options: KvsLocalStorageOptions<Schema>
): Promise<KvsStorage<Schema>> => {
    const defaultCacheDir = path.join(appRoot.toString(), ".cache");
    if (!options.storeFilePath) {
        await mkdirp(defaultCacheDir);
    }
    const saveFilePath = options.storeFilePath
        ? options.storeFilePath
        : path.join(defaultCacheDir, "kvs-node-localstorage");
    return kvsStorage({
        ...options,
        storage: new LocalStorage(saveFilePath)
    });
};
