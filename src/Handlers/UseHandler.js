const fs = require('fs');
const path = require('path');

const Output = require('../Console/Output');
const File = require('../Filesystem/File');
const System = require('../Helpers/System');
const Process = require('../Helpers/Process');

class UseHandler {
    constructor(config) {
        this.config = config;

        this.execute();
    }

    execute() {
        const logs = {
            oldPath: null,
            newPath: null,
            output: null
        };

        switch (System.getOSType()) {
            case 'nt':
                const pathToRelease = `${File.getPathToInstallationDir()}${System.getPathSeparator()}${this.buildReleaseDirName()}`;

                if (!fs.existsSync(pathToRelease) || !fs.statSync(pathToRelease).isDirectory()) {
                    Output.error(`This release hasn't been installed.`);
                    return;
                }

                let path = Process.getPathEnvironmentVariable();

                if (!path) {
                    Output.error(`Unable to get system PATH variables.`)
                    return;
                }

                path = path.split(';').filter(p => p).join(';');

                const pathToCurrentPhpInstallation = Process.getDirToCurrentPhpInstallation();
                let newPath = path;

                if (pathToCurrentPhpInstallation) {
                    newPath = path.replace(pathToCurrentPhpInstallation, pathToRelease);

                    Output.warning('Existing PHP installation found.')
                } else {
                    newPath = newPath.split(';');
                    newPath.push(pathToRelease);
                    newPath = newPath.join(';');

                    Output.warning('No previous PHP installation found.');
                }

                logs.oldPath = path;
                logs.newPath = newPath;

                console.log(newPath);
                console.log(newPath.length);

                if (newPath.length > 1024) {
                    Output.error([
                        `Unable to set the path variable as the character limit has been reached. This is a restriction on Windows.`,
                        `You'll need to set the path manually: ${pathToRelease}`
                    ]);
                    return;
                }

                const {successful, output} = Process.setPath(newPath);

                logs.output = output;

                this.storeLogs(logs);

                if (!successful) {
                    Output.error([
                        `Failed to activate release. ${output}`,
                        `You'll need to set the path manually: ${pathToRelease}`
                    ]);
                    return;
                }

                Output.success(`Release has been activated. Refresh any terminals before attempting to use.`);
                break;

            case '*nix':
                Output.error('*nix systems are not currently supported.');
                break;

            default:
                Output.error('Unknown OS.')
        }
    }

    buildReleaseDirName() {
        let name = this.config.version;
        name += this.config.threadSafe ? '-ts' : '-nts';
        name += `-${this.config.archType}`;
        name += `-${System.getOSType()}`;

        return name;
    }

    storeLogs(logs) {
        const fileName = new Date().toISOString().split('T').join().replaceAll('-', '').replaceAll(',', '').replaceAll(':', '').split('.')[0],
            pathToLogFile = `${File.getPathToLogs()}${System.getPathSeparator()}${this.buildReleaseDirName()}-${fileName}.json`;

        fs.writeFileSync(pathToLogFile, JSON.stringify(logs), {
            encoding: 'utf8'
        });
    }
}

module.exports = UseHandler;
