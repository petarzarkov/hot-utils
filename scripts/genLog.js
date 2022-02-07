
const { execSync, spawn } = require('child_process');
const fs = require("fs");

const getCommitPkgV = (commit) => {
    try {
        return JSON.parse(execSync(`git show "${commit}:package.json"`).toString())?.version || "unknown";
    } catch (error) {
        return "unknown";
    }
}

(async () => {
    try {
        console.log("Starting generation of changelog")
        
        const branch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
        const git = spawn('git', [
            'log',
            `origin/${branch}`,
            `--pretty=format:{"commit": "%H","authorName": "%an","authorEmail": "%aE","date": "%ad","subject": "%s","message": "%f"}`
        ]);
        
        const initialChangelog = await new Promise((resolve, reject) => {
            let buf = Buffer.alloc(0);

            git.stdout.on("data", (data) => {
                buf = Buffer.concat([buf, data])
            });
            git.stderr.on("data", (data) => {
                reject(data.toString());
            });
            git.on("close", (code) => {
                resolve(buf.toString().split('\n').map(e => JSON.parse(e)));
            });
        });

        const additionalChangelog = initialChangelog.map(log => {
            const branch = execSync(`git name-rev ${log.commit}`).toString().split(" ")[1].split('\n')[0] || "Deleted";
            const version = getCommitPkgV(log.commit);
            return {
                version,
                branch,
                ...log
            }

        });

        console.log(additionalChangelog);


        fs.writeFileSync("CHANGELOG.md", `### Changelog
---

${additionalChangelog.map(ac => {
    return `
- ${ac.subject}
\`\`\`
${Object.keys(ac).map(k => (`${[k]}: ${ac[k]}\n`)).toString().replace(/,/g, "")}
\`\`\`

    `
}).toString().replace(/    ,/g, "")}
`
    );
    } catch (error) {
        console.log({ message: "Error on generating changelog", error });
    }
})();