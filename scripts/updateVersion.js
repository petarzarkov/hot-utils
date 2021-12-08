const execSync = require('child_process').execSync;
const getNewVersion = require("./getNewVersion");

(async () => {
    try {
        const pkg = require('../package.json');
        console.log(`Starting setup of pkg version for ${pkg.name}...`);
        if (!pkg.version) {
            throw new Error("Missing pkg version!");
        }

        console.log("Current Version ->", pkg.version);
        const newVersion = getNewVersion(pkg.version);
        console.log("New Version ->", newVersion);

        execSync(`npm version ${newVersion} --no-git-tag-version`);
        const branch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
        execSync("git add ./package.json");
        execSync(`git commit -am "[branch|${branch}] version of ${pkg.name} bumped to ${newVersion}"`);

        console.log(`Finished versioning, version bumped to ${newVersion}!`);

    } catch (error) {
        console.log({ message: "Error on versioning", error });
    }
})();

