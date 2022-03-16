export const optionalImport = <Import = unknown>(pkg: string): Import | null => {
    try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        return require(pkg) as Import;
    } catch (error) {
        return null;
    }
};