/**
 * Determines if an object has a property
 * useful for type checking and removes the need of casting to specific type just to access a property
 * @param {Record<string, unknown>} obj any object
 * @param {string | number | symbol} prop any string | number | symbol
 * @returns {boolean} boolean
 */
export function hasProp<X, Y extends PropertyKey>(obj: X, prop: Y): obj is X & Record<Y, unknown> {
    return Object.prototype.hasOwnProperty.call(obj, prop);
}

/**
 * If object has a property, returns its value or undefined if missing
 * useful for type inference
 * @param {Record<PropertyKey, unknown>} obj any object
 * @param {PropertyKey} key any string | number | symbol
 */
export function getValue<X, Y extends keyof X>(obj: X, key: Y): X[Y] | undefined {
    return obj[key];
}

/**
 * Return a partial object with matched keys - if all are matched, returns the whole obj
 * useful for type inference
 * @param {Record<PropertyKey, unknown>} obj any object
 * @param {Array<PropertyKey>} keys any array of string | number | symbol
 */
export function strip<X, Y extends keyof X>(obj: X, keys: Y[]): Partial<X> {
    const strippedObj: Partial<X> = {};
    for (const key of keys) {
        if (strippedObj[key]) {
            continue;
        }

        if (obj[key]) {
            strippedObj[key] = obj[key];
        }
    }

    return strippedObj;
}

/**
 * Optimized shallowed equals with type inference
 * @param {Record<PropertyKey, unknown>} objA any object
 * @param {Record<PropertyKey, unknown>} objB any object
 */
export function shallowEquals<X extends Record<PropertyKey, unknown>, Y extends Record<PropertyKey, unknown>>(objA: X, objB: Y): boolean {
    if (Object.is(objA, objB)) {
        return true;
    }

    if (typeof objA !== "object" || objA === null || typeof objB !== "object" || objB === null) {
        return false;
    }

    const keysA = Object.keys(objA);
    if (!keysA.length) {
        return false;
    }

    if (keysA.length !== Object.keys(objB).length) {
        return false;
    }

    for (const key of keysA) {
        if (!hasProp(objB, key) || !Object.is(getValue(objA, key), getValue(objB, key))) {
            return false;
        }
    }

    return true;
}
