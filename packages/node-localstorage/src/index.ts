import path from "path";
import { JsonValue, KvsStorage, kvsStorage } from "@kvs/storage";
import { KVS, KVSOptions } from "@kvs/types";
import fs from "node:fs/promises";
// @ts-ignore
import { LocalStorage } from "node-localstorage";
// @ts-ignore
import appRoot from "app-root-path";

export type KvsLocalStorageSchema = {
    [index: string]: JsonValue;
};
export type KvsLocalStorage<Schema extends KvsLocalStorageSchema> = KVS<Schema>;
export type KvsLocalStorageOptions<Schema extends KvsLocalStorageSchema> = KVSOptions<Schema> & {
    kvsVersionKey?: string;
    storeFilePath?: string;
    storeQuota?: number;
};
export const kvsLocalStorage = async <Schema extends KvsLocalStorageSchema>(
    options: KvsLocalStorageOptions<Schema>
): Promise<KvsStorage<Schema>> => {
    const defaultCacheDir = path.join(appRoot.toString(), ".cache");
    if (!options.storeFilePath) {
        await fs.mkdir(defaultCacheDir, {
            recursive: true
        });
    }
    const saveFilePath = options.storeFilePath
        ? options.storeFilePath
        : path.join(defaultCacheDir, "kvs-node-localstorage");
    const storeQuota = options.storeQuota ? options.storeQuota : 5 * 1024 * 1024;
    return kvsStorage({
        ...options,
        storage: new LocalStorage(saveFilePath, storeQuota)
    });
};
