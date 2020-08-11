export type StorageSchema = {
    [index: string]: any;
};
// https://stackoverflow.com/questions/51465182/typescript-remove-index-signature-using-mapped-types
export type KnownKeys<T> = {
    [K in keyof T]: string extends K ? never : number extends K ? never : K;
} extends { [_ in keyof T]: infer U }
    ? U
    : never;
/**
 * Extract known object store names from the DB schema type.
 *
 * @template DBTypes DB schema type, or unknown if the DB isn't typed.
 */
export type StoreNames<DBTypes extends StorageSchema | unknown> = DBTypes extends StorageSchema
    ? KnownKeys<DBTypes>
    : string;
/**
 * Extract database value types from the DB schema type.
 *
 * @template DBTypes DB schema type, or unknown if the DB isn't typed.
 * @template StoreName Names of the object stores to get the types of.
 */
export type StoreValue<
    DBTypes extends StorageSchema | unknown,
    StoreName extends StoreNames<DBTypes>
> = DBTypes extends StorageSchema ? DBTypes[StoreName] : any;

export type KVS<Schema extends StorageSchema> = {
    /**
     * Removes all key-value pairs from the storage
     */
    clear(): Promise<void>;
    /**
     * Returns true if an element in the storage object existed and has been removed, or false if the element does not exist.
     * @param key
     */
    delete(key: StoreNames<Schema>): Promise<boolean>;
    /**
     * Returns the value associated to the key, or undefined if there is none.
     * @param key
     */
    get<K extends StoreNames<Schema>>(key: K): Promise<StoreValue<Schema, K> | undefined>;
    /**
     * Returns a boolean asserting whether a value has been associated to the key in the storage object or not.
     * @param key
     */
    has(key: StoreNames<Schema>): Promise<boolean>;
    /**
     * Sets the value for the key in the storage object. Returns the storage object.
     * @param key
     * @param value
     */
    set<K extends StoreNames<Schema>>(key: K, value: StoreValue<Schema, K> | undefined): Promise<KVS<Schema>>;
    /*
     * Close the KVS connection
     * DB-like KVS close the connection via this method
     * Of course, localStorage-like KVS implement do nothing. It is just noop function
     */
    close(): Promise<void>;
} & AsyncIterable<[StoreNames<Schema>, StoreValue<Schema, StoreNames<Schema>>]>;
export type KVSOptions<Schema extends StorageSchema> = {
    name: string;
    version: number;
    upgrade?({
        kvs,
        oldVersion,
        newVersion
    }: {
        kvs: KVS<Schema>;
        oldVersion: number;
        newVersion: number;
    }): Promise<any>;
} & {
    // options will be extended
    [index: string]: any;
};
export type KVSConstructor<Schema extends StorageSchema> = (options: KVSOptions<Schema>) => Promise<KVS<Schema>>;
/**
 * Sync Version
 */
// export type KVSSync<Schema extends StorageSchema> = {
//     clear(): void;
//     delete(key: KeyOf<Schema>): boolean;
//     get<T extends KeyOf<Schema>>(key: keyof T): Schema[T] | undefined;
//     has(key: KeyOf<Schema>): boolean;
//     set<T extends KeyOf<Schema>>(key: T, value: Schema[T] | undefined): Schema;
//     /*
//      * Close the KVS connection
//      * DB-like KVS close the connection via this method
//      * Of course, localStorage-like KVS implement do nothing. It is just noop function
//      */
//     close(): void;
// } & Iterable<[KeyOf<Schema>, ValueOf<Schema>]>;
// export type KVSSyncOptions<Schema extends StorageSchema> = {
//     name: string;
//     version: number;
//     upgrade?({ kvs, oldVersion, newVersion }: { kvs: KVS<Schema>; oldVersion: number; newVersion: number }): any;
// };
