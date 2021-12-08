export * from "./helpers";
export * from "./utils";
export * from "./contracts";

import { HotLogger } from "./helpers/logger";

const newLogger = HotLogger.createLogger("WeHot");

newLogger.error("Some err msg", { err: new Error("yer error") });
