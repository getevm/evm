const fs = require('fs');

const System = require('../Helpers/System');

class File {
    static createPrerequisiteDirectories() {
        const dirs = [
            this.getPathToLogs()
        ];

        for (const dir of dirs) {
            if (fs.existsSync(dir) && fs.statSync(dir).isDirectory()) {
                continue;
            }

            fs.mkdirSync(dir, {
                recursive: true
            });
        }
    }

    static getPathToInstallationDir() {
        let path = null;

        switch (System.getOSType()) {
            case 'nt':
                path = `${System.getHomrDir().split('\\')[0]}${System.getPathSeparator()}evm`;
                break;

            case '*nix':
                path = `${System.getHomrDir()}${System.getPathSeparator()}evm`;
                break;

            default:
                return null;
        }

        if (!path) {
            return null;
        }

        if (!fs.existsSync(path)) {
            fs.mkdirSync(path, {
                recursive: true
            });
        }

        return path;
    }

    static getPathToLogs() {
        return `${this.getPathToInstallationDir()}${System.getPathSeparator()}logs`;
    }

    static rrmdir(path, iterations = 0) {
        if (fs.statSync(path).isDirectory()) {
            const resources = fs.readdirSync(path);

            for (const resource of resources) {
                const resourcePath = `${path}${System.getPathSeparator()}${resource}`;

                if (fs.statSync(resourcePath).isDirectory()) {
                    this.rrmdir(resourcePath, iterations + 1);
                    fs.rmdirSync(resourcePath);
                    continue;
                }

                if (fs.statSync(resourcePath).isFile()) {
                    fs.unlinkSync(resourcePath);
                }
            }

            if (iterations === 0) {
                fs.rmdirSync(path);
            }
        }
    }
}

module.exports = File;
