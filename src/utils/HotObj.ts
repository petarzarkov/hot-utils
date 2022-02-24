import { Expand } from "../contracts";

export class HotObj {
    /**
     * Determines if an object has a property
     * useful for type checking and removes the need of casting to specific type just to access a property
     * @param {Record<string, unknown>} obj any object
     * @param {string | number | symbol} prop any string | number | symbol
     * @returns {boolean} boolean
     */
    public static hasProp<X, Y extends PropertyKey>(obj: X, prop: Y): obj is X & Record<Y, unknown> {
        return Object.prototype.hasOwnProperty.call(obj, prop);
    }

    /**
     * If object has a property, returns its value or undefined if missing
     * useful for type inference
     * @param {Record<PropertyKey, unknown>} obj any object
     * @param {PropertyKey} key any string | number | symbol
     */
    public static getValue<X, Y extends keyof X>(obj: X, key: Y): X[Y] | undefined {
        return obj[key];
    }

    /**
     * Return a partial object with matched keys - if all are matched, returns the whole obj
     * useful for type inference
     * @param {Record<PropertyKey, unknown>} obj any object
     * @param {Array<PropertyKey>} keys any array of string | number | symbol
     */
    public static extract<X, Y extends keyof X>(obj: X, keys: Y[]): Expand<Pick<X, Y>> {
        const newRef = { ...obj };

        return Object.keys(newRef).reduce((prev, curr) => {
            const asKey = curr as Y;
            if (keys.includes(asKey)) {
                (prev as Partial<X>)[asKey] = newRef[asKey];
            }
            return prev;
        }, {} as Expand<Pick<X, Y>>);
    }

    /**
     * Optimized shallowed equals with type inference
     * @param {Record<PropertyKey, unknown>} objA any object
     * @param {Record<PropertyKey, unknown>} objB any object
     */
    public static shallowEquals<X extends Record<PropertyKey, unknown>, Y extends Record<PropertyKey, unknown>>(objA: X, objB: Y): boolean {
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
            if (!this.hasProp(objB, key) || !Object.is(this.getValue(objA, key), this.getValue(objB, key))) {
                return false;
            }
        }

        return true;
    }

    /**
     * Removes properties with values: undefined, null, NaN
     * @param obj object to remove nullable properties from
     * @returns the same object without undefined, null, NaN properties
     */
    public static cleanUpNullables<Nullable extends Record<PropertyKey, unknown>>(obj: Nullable): NonNullable<Partial<Nullable>> {
        Object.keys(obj).map((item) => {
            if (["null", "undefined", "NaN", null, undefined, NaN].includes(<string | number | null | undefined>obj[item])) {
                delete obj[item];
            }
        });

        return obj;
    }

}