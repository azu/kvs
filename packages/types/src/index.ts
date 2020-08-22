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
     * Returns the value associated to the key.
     * If the key does not exist, returns `undefined`.
     */
    get<K extends StoreNames<Schema>>(key: K): Promise<StoreValue<Schema, K> | undefined>;
    /**
     * Sets the value for the key in the storage. Returns the storage.
     */
    set<K extends StoreNames<Schema>>(key: K, value: StoreValue<Schema, K> | undefined): Promise<KVS<Schema>>;
    /**
     * Returns a boolean asserting whether a value has been associated to the key in the storage.
     */
    has(key: StoreNames<Schema>): Promise<boolean>;
    /**
     * Returns true if an key in the storage existed and has been removed.
     * Returns false if the key does not exist.
     */
    delete(key: StoreNames<Schema>): Promise<boolean>;
    /**
     * Removes all key-value pairs from the storage.
     * Note: clear method does not delete the storage.
     * In other words, after clear(), the storage still has internal metadata like version.
     */
    clear(): Promise<void>;
    /**
     * Drop the storage.
     * It delete all data that includes metadata completely.
     */
    dropInstance(): Promise<void>;
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
export type KVSSync<Schema extends StorageSchema> = {
    /**
     * Returns the value associated to the key.
     * If the key does not exist, returns `undefined`.
     */
    get<K extends StoreNames<Schema>>(key: K): StoreValue<Schema, K> | undefined;
    /**
     * Sets the value for the key in the storage. Returns the storage.
     */
    set<K extends StoreNames<Schema>>(key: K, value: StoreValue<Schema, K> | undefined): KVSSync<Schema>;
    /**
     * Returns a boolean asserting whether a value has been associated to the key in the storage.
     */
    has(key: StoreNames<Schema>): boolean;
    /**
     * Returns true if an key in the storage existed and has been removed.
     * Returns false if the key does not exist.
     */
    delete(key: StoreNames<Schema>): boolean;
    /**
     * Removes all key-value pairs from the storage.
     * Note: clear method does not delete the storage.
     * In other words, after clear(), the storage still has internal metadata like version.
     */
    clear(): void;
    /**
     * Drop the storage.
     * It delete all data that includes metadata completely.
     */
    dropInstance(): void;
    /*
     * Close the KVS connection
     * DB-like KVS close the connection via this method
     * Of course, localStorage-like KVS implement do nothing. It is just noop function
     */
    close(): void;
} & Iterable<[StoreNames<Schema>, StoreValue<Schema, StoreNames<Schema>>]>;

export type KVSSyncOptions<Schema extends StorageSchema> = {
    name: string;
    version: number;
    upgrade?({ kvs, oldVersion, newVersion }: { kvs: KVSSync<Schema>; oldVersion: number; newVersion: number }): any;
};
