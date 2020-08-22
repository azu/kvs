// const createSyncStore = <K extends KVSStorageKey, V extends JsonValue>({
//                                                                            storage,
//                                                                            kvsVersionKey
//                                                                        }: {
//     storage: Storage;
//     kvsVersionKey: string;
// }) => {
//     const store = {
//         get(key: K): V | undefined {
//             return getItem(storage, key);
//         },
//         has(key: K): boolean {
//             return hasItem(storage, key);
//         },
//         set(key: K, value: V | undefined): KVSSync<K, V> {
//             setItem(storage, key, value);
//             return store;
//         },
//         clear(): Promise<void> {
//             return Promise.resolve().then(() => {
//                 return clearItem(storage, kvsVersionKey);
//             });
//         },
//         delete(key: K): boolean {
//             return deleteItem(storage, key);
//         },
//         [Symbol.iterator](): Iterator<[K, V]> {
//             return createIterator<K, V>(storage, kvsVersionKey);
//         }
//     };
//     return store;
// };
// export const kvsStorageSync = async <K extends KVSStorageKey, V extends JsonValue>(
//     options: KvsStorageOptions<K, V>
// ): Promise<KvsStorage<K, V>> => {
//     const { name, version, upgrade, ...kvStorageOptions } = options;
//     const kvsVersionKey = kvStorageOptions.kvsVersionKey ?? "__kvs_version__";
//     const storage = await openStorage({
//         storage: options.storage,
//         version: options.version,
//         onUpgrade: ({ oldVersion, newVersion, storage }) => {
//             if (!options.upgrade) {
//                 return;
//             }
//             return options.upgrade({
//                 kvs: createSyncStore({ storage, kvsVersionKey }),
//                 newVersion,
//                 oldVersion
//             });
//         },
//         kvsVersionKey
//     });
//     return createSyncStore({ storage, kvsVersionKey });
// };
