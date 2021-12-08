function getNewVersion (ver) {
    let [major, minor, patch] = ver.split(".").map(v => parseInt(v));

    let patched = false;
    let minored = false;

    if (patch === 9) {
        if (minor <= 8) {
            minor += 1;
            minored = true;
        }
        patch = 0;
        patched = true;
    }

    if (minor === 9 && !minored) {
        major += 1;
        minor = 0;
    }

    if (patch <= 8 && !patched) {
        patch += 1;
    }

    return [major, minor, patch].join(".");
}

module.exports = getNewVersion;