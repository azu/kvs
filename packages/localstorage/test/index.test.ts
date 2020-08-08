import { kvsLocalStorage } from "../src";
import { createKVSTestCase } from "@kvs/common-test-case";

const databaseName = "kvs-test";
const kvsTestCase = createKVSTestCase(
    (options) =>
        kvsLocalStorage({
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
                name: "object",
                value: {
                    prop: "propValue"
                },
                type: "object"
            }
        ]
    }
);
const deleteAllDB = async () => {
    if (!kvsTestCase.ref.current) {
        return;
    }
    try {
        await kvsTestCase.ref.current.clear();
        // await kvs.dropInstance();
    } catch (error) {
        console.error("deleteAllDB", error);
    }
};
describe("@kvs/localstorage", () => {
    before(deleteAllDB);
    afterEach(deleteAllDB);
    kvsTestCase.run();
});
