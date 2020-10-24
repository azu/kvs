import { kvsEnvStorage } from "@kvs/env";

(async () => {
    type StorageSchema = {
        a1: string;
        b2: number;
        c3: boolean;
    };
    console.group("[kvs] open");
    // open database and initialize it
    const storage = await kvsEnvStorage<StorageSchema>({
        name: "database-name",
        version: 1
    });
    console.log("opened storage", storage);
    console.groupEnd();
    console.group("[kvs] set");
    // set
    await storage.set("a1", "string"); // type check
    await storage.set("b2", 42);
    await storage.set("c3", false);
    console.log("set a1,b2,c3");
    console.groupEnd();
    console.group("[kvs] has");
    // has
    console.log("has a1:", await storage.has("a1")); // => true
    console.log("has b2:", await storage.has("b2")); // => true
    console.log("has c3:", await storage.has("c3")); // => true
    // @ts-expect-error: this is not defind
    console.log("has not_defined:", await storage.has("not_defined")); // => false
    console.groupEnd();
    // get
    console.group("[kvs] get");
    const a1 = await storage.get("a1"); // a1 will be string type
    const b2 = await storage.get("b2");
    const c3 = await storage.get("c3");
    console.log("a1", a1);
    console.log("b2", b2);
    console.log("c3", c3);
    console.groupEnd();
    console.group("[kvs] iterate");
    // iterate
    for await (const [key, value] of storage) {
        console.log([key, value]);
    }
    console.groupEnd();
    // delete
    console.group("[kvs] delete");
    console.log("a1", await storage.delete("a1"));
    console.groupEnd();
    console.group("[kvs] clear");
    // clear all data
    await storage.clear();
    console.groupEnd();
    console.group("[kvs] dropInstance");
    await storage.dropInstance();
    console.groupEnd();
})();
