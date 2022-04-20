const fs = require('fs');

const Output = require('../Console/Output');
const System = require('../Helpers/System');
const File = require('../Filesystem/File');
const Process = require('../Helpers/Process');

class LsHandler {
    async execute() {
        const resources = fs.readdirSync(File.getPathToInstallationDir());

        Output.std('-----------------------------------------------------');

        for (let resource of resources) {
            const path = `${File.getPathToInstallationDir()}${System.getPathSeparator()}${resource}`;

            if (['logs'].includes(resource)) {
                continue;
            }

            const [version, ts, archType, osType] = resource.split('-');
            const versionDescription = `${version}, ${ts}, ${archType}, and ${osType}`;

            if (path === Process.getDirToCurrentPhpInstallation()) {
                Output.success(`${versionDescription} (active)`);
            } else {
                Output.std(`${versionDescription}`);
            }
        }

        Output.std('-----------------------------------------------------');
    }
}

module.exports = LsHandler;
