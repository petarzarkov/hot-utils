/** Mark some properties which only the former including as optional and set the value to never */
export type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };