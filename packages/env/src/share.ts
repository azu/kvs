import { JsonValue } from "@kvs/storage";
import { KVS, KVSOptions } from "@kvs/types";

export type KvsEnvStorageSchema = {
    [index: string]: JsonValue;
};
export type KvsEnvStorage<Schema extends KvsEnvStorageSchema> = KVS<Schema>;
export type KvsEnvStorageOptions<Schema extends KvsEnvStorageSchema> = KVSOptions<Schema>;
