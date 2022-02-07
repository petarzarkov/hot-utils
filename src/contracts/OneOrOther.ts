import { Expand } from "./Expand";
import { Without } from "./Without";

/** get the OneOrOther type which could make 2 types exclude each other */
export type OneOrOther<T, U> = Expand<T | U extends Record<PropertyKey, unknown> ? (Without<T, U> & U) | (Without<U, T> & T) : T | U>;