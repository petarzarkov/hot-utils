import config from "config";

export const VERSION = process.env.npm_package_version;
export const APP_NAME = process.env.npm_package_name;
export const NODE_ENV: string = process.env.NODE_ENV as string || "development";
export const DEFAULT_TIMEOUT: number = process.env.DEFAULT_TIMEOUT ?
    parseInt(process.env.DEFAULT_TIMEOUT) :
    (config.has("defaultTimeout") ? config.get("defaultTimeout") : 10000);