import { HotLogger } from "../../../../src/helpers/hotLogger";

describe("HotLogger Test Suite", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test.each`
    desc       |loggerParams            
    ${"trace"} |${{ context: "ctx1", level: "trace" }}         
    ${"debug"} |${{ context: "ctx2", level: "debug" }}          
    ${"info"}  |${{ context: "ctx3", level: "info" }}                
    ${"warn"}  |${{ context: "ctx4", level: "warn" }}           
    ${"error"} |${{ context: "ctx5", level: "error", error: new Error("some error") }}           
    ${"fatal"} |${{ context: "ctx6", level: "fatal", error: new Error("some fatal error") }}           
    `("$desc", async (
        { loggerParams }:
            { loggerParams: { level: "info" | "debug" | "warn" | "error" | "fatal" | "trace"; context: string; error: Error } }
    ) => {

        const logger = HotLogger.createLogger(<string>loggerParams.context);
        const msg = `Some ${loggerParams.level} message`;
        const logSpy = jest.spyOn(logger, loggerParams.level);
        logger[loggerParams.level](msg, { err: loggerParams?.error as Error });

        
        expect(logSpy).toBeCalledTimes(1);
        expect(logSpy).toHaveBeenCalledWith(msg, {});
    });

    test("creates child of a logger instance", () => {
        const logger = HotLogger.createLogger("parent");
        const logChild = logger.child("child");
        const logSpy = jest.spyOn(logChild, "info");

        logChild.info("Some child message");

        expect(logSpy).toBeCalledTimes(1);
        expect(logSpy).toHaveBeenCalledWith("Some child message");
    });
});
