export const optionalImport = <Import>(pkg: string): Import | null => {
    let imp: Import | null;
    try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        imp = require(pkg) as Import;
    } catch (error) {
        imp = null;
    }

    return imp;
};