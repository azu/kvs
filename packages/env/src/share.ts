import { JsonValue, KVSStorageKey } from "@kvs/storage";
import { KVS } from "@kvs/types";
import { KvsLocalStorageOptions } from "@kvs/node-localstorage";

export type KvsEnvStorage<K extends KVSStorageKey, V extends JsonValue> = KVS<K, V>;
export type KvsEnvStorageOptions<K extends KVSStorageKey, V extends JsonValue> = KvsLocalStorageOptions<K, V>;
