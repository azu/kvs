import { KVSIndexedDB, kvsIndexedDB } from "../src";
import { createKVSTestCase } from "@kvs/common-test-case";

const databaseName = "kvs-test";
const kvsTestCase = createKVSTestCase(
    (options) =>
        kvsIndexedDB({
            ...options,
            name: databaseName,
            debug: true
        }),
    {
        setTestDataList: [
            {
                name: "string",
                value: "str"
            },
            {
                name: "number",
                value: 42
            },
            {
                name: "boolean",
                value: false
            },
            {
                name: "date",
                value: new Date(),
                type: "object"
            },
            {
                name: "object",
                value: {
                    prop: "propValue"
                },
                type: "object"
            }
            // Edge, old-Safari does not support Blob
            // https://github.com/jakearchibald/idb/issues/58
            // {
            //     name: "blob",
            //     value: new Blob(["Hello, world!"], { type: "text/plain" }),
            //     type: "object"
            // }
        ]
    }
);
const deleteAllDB = async () => {
    const kvs = kvsTestCase.ref.current as KVSIndexedDB<any, any> | null;
    if (!kvs) {
        return;
    }
    try {
        await kvs.clear();
        await kvs.dropInstance();
    } catch (error) {
        console.error("deleteAllDB", error);
    }
};

describe("@kvs/indexedDB", () => {
    before(deleteAllDB);
    afterEach(deleteAllDB);
    kvsTestCase.run();
});
