import type { KVS, KnownKeys, StoreNames } from "../src";
import { expectType } from "tsd";

declare var keys: KnownKeys<{
    a: string;
    b: number;
    [index: string]: string | number;
}>;
expectType<"a" | "b">(keys);
declare var storeNames: StoreNames<{
    a: string;
    b: number;
    [index: string]: string | number;
}>;
expectType<"a" | "b">(storeNames);
// Complex Schema
declare var schemaStorage: KVS<{
    a: string;
    b: number;
}>;
expectType<Promise<string | undefined>>(schemaStorage.get("a"));
// FIXME: should support Mapped Types
// declare var mappedStorage: KVS<{
//     [index: string]: string;
// }>;
//
// expectType<Promise<string | undefined>>(mappedStorage.get("key"));
