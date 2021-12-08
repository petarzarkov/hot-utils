import config from "config";

export const VERSION = process.env.npm_package_version;
export const APP_NAME: string = process.env.APP_NAME || process.env.npm_package_name || (config.has("appName") ? config.get("appName") : "hotstuff");
export const NODE_ENV = process.env.NODE_ENV || "development";
export const LOG_LEVEL: string | undefined = process.env.LOG_LEVEL;
export const DEFAULT_HTTP_TIMEOUT: number = process.env.DEFAULT_HTTP_TIMEOUT ?
    parseInt(process.env.DEFAULT_HTTP_TIMEOUT) :
    (config.has("defaultHttpTimeout") ? config.get("defaultHttpTimeout") : 10000);