import { IConfig } from "config";
import { optionalImport } from "./utils";

export const config = optionalImport<IConfig>("config");

export const VERSION = process.env.npm_package_version;
export const APP_NAME: string = process.env.APP_NAME || process.env.npm_package_name || (config?.has("appName") ? config.get("appName") : "hot-utils");
export const NODE_ENV = process.env.NODE_ENV || "development";
export const LOG_LEVEL: string | undefined = process.env.LOG_LEVEL;
export const HOT_DEFAULT_HTTP_TIMEOUT: number = process.env.HOT_DEFAULT_HTTP_TIMEOUT ?
    Number(process.env.HOT_DEFAULT_HTTP_TIMEOUT) || 10000 :
    (config?.has("defaultHttpTimeout") ? config.get("defaultHttpTimeout") : 10000);