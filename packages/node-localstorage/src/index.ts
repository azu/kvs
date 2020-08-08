import path from "path";
import { JsonValue, KvsStorage, kvsStorage, KVSStorageKey } from "@kvs/storage";
import { KVS, KVSOptions } from "@kvs/types";
// @ts-ignore
import { LocalStorage } from "node-localstorage";
// @ts-ignore
import appRoot from "app-root-path";
// @ts-ignore
import mkdirp from "mkdirp";

export type KvsLocalStorage<K extends KVSStorageKey, V extends JsonValue> = KVS<K, V>;
export type KvsLocalStorageOptions<K extends KVSStorageKey, V extends JsonValue> = KVSOptions<K, V> & {
    kvsVersionKey?: string;
    storeFilePath?: string;
};
export const kvsLocalStorage = async <K extends KVSStorageKey, V extends JsonValue>(
    options: KvsLocalStorageOptions<K, V>
): Promise<KvsStorage<K, V>> => {
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
