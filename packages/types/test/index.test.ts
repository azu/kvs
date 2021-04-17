import type { KVS } from "../src";
import { expectType } from "tsd";

// should support Mapped Types
declare var kvs: KVS<{
    [index: string]: string;
}>;

expectType<Promise<string | undefined>>(kvs.get("key"));
