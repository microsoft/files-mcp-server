import { stringIsNullOrEmpty } from "./utils.js";

function safeReadEnv(name: string, throwOnError = true): string {

    if (!stringIsNullOrEmpty(process.env[name])) {
        return process.env[name];
    }

    if (throwOnError) {
        throw Error(`Could not read env property ${name}`);
    }
}

export const clientId = safeReadEnv("ODMCP_CLIENT_ID");

export const tenantId = safeReadEnv("ODMCP_TENANT_ID");

export const verbose = safeReadEnv("ODMCP_VERBOSE", false) || false;
