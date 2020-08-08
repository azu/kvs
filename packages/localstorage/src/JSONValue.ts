// Based on https://github.com/sindresorhus/type-fest/blob/master/source/basic.d.ts
export type Primitive = null | undefined | string | number | boolean | symbol | bigint;

/**
 Matches a JSON object.
 This type can be useful to enforce some input to be JSON-compatible or as a super-type to be extended from. Don't use this as a direct return type as the user would have to double-cast it: `jsonObject as unknown as CustomResponse`. Instead, you could extend your CustomResponse type from it to ensure your type only uses JSON-compatible types: `interface CustomResponse extends JsonObject { … }`.
 */
export type JsonObject = { [Key in string]?: JsonValue };

/**
 Matches a JSON array.
 */
export interface JsonArray extends Array<JsonValue> {}

/**
 Matches any valid JSON value.
 */
export type JsonValue = string | number | boolean | null | JsonObject | JsonArray;
