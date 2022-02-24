import { HotObj } from "../../src/utils/HotObj";

describe("HotObj Test Suite", () => {
    test("that some object has a prop", async () => {
        const someObj = {
            prop: "val"
        };

        const result1 = HotObj.hasProp(someObj, "prop");
        const result2 = HotObj.hasProp(someObj, "non-existent-prop");

        expect(result1).toEqual(true);
        expect(result2).toEqual(false);
    });

    it("gets value with type inference", async () => {
        const someObj = {
            prop: "val"
        };

        const result = HotObj.getValue(someObj, "prop");

        expect(result).toEqual("val");
    });

    it("extract object properly with type inference", async () => {
        const someObj = {
            prop: "val",
            propTwo: "val2",
            propThree: "val3"
        };

        const result = HotObj.extract(someObj, ["propTwo", "propThree"]);

        expect(result).toEqual({
            propTwo: "val2",
            propThree: "val3"
        });
    });

    test("shallow equality of two objects", async () => {
        const someObj1 = {
            prop: "val",
            propTwo: "val2",
            propThree: "val3"
        };
        const someObj2 = {
            prop: "val",
            propTwo: "val2",
            propThree: "val3"
        };

        const someObjSameRef = someObj2;
        const result = HotObj.shallowEquals(someObj1, someObj2);
        const resultThree = HotObj.shallowEquals(someObjSameRef, someObj2);
        // Same array values but diff obj ref
        Object.assign(someObj1, { mixin: [{ ref: "1" }] });
        Object.assign(someObj2, { mixin: [{ ref: "1" }] });
        const resultTWo = HotObj.shallowEquals(someObj1, someObj2);

        expect(result).toEqual(true);
        expect(resultThree).toEqual(true);
        expect(resultTWo).toEqual(false);
    });

    test("negative shallow equality of two objects", async () => {
        const someObj1 = {};
        const someObj2 = {};

        const result = HotObj.shallowEquals(someObj1, someObj2);
        const vals = ["val", "val"]
        const resultTWo = HotObj.shallowEquals(vals[0] as unknown as Record<string, unknown>, vals[1] as unknown as Record<string, unknown>);

        expect(result).toEqual(false);
        expect(resultTWo).toEqual(true);
    });

    it("cleans up nullables", async () => {
        const someObj = {
            prop: null,
            propTwo: undefined,
            propThree: Number("undefined"),
            propStr: "null",
            propTwoStr: "undefined",
            propThreeStr: "NaN",
            proper: "val"
        };

        const result = HotObj.cleanUpNullables(someObj);

        expect(result).toEqual({ proper: "val" });
    });
});
