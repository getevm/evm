const fs = require('fs');
const os = require('os');
const path = require('path');
const {execSync} = require('child_process');

const System = require('./System');

class Process {
    static unzip(pathToArchive, pathToOutput, deleteAfterUnzip = false) {
        try {
            switch (System.getOSType()) {
                case 'nt':
                    execSync(`Expand-Archive -Force "${pathToArchive}" "${pathToOutput}"`, {
                        shell: 'powershell.exe'
                    });

                    if (deleteAfterUnzip) {
                        fs.unlinkSync(pathToArchive);
                    }

                    return true;

                case '*nix':
                    break;

                default:
                    return null;
            }
        } catch (e) {
            return null;
        }
    }

    static getPathEnvironmentVariable() {
        try {
            switch (System.getOSType()) {
                case 'nt':
                    const response = execSync('echo %Path%', {
                        encoding: 'utf8'
                    });

                    return response.trim();

                case '*nix':
                    break;

                default:
                    return null;
            }
        } catch (e) {
            return null;
        }
    }

    static getDirToCurrentPhpInstallation() {
        try {
            switch (System.getOSType()) {
                case 'nt':
                    let response = execSync(`where php 2>&1`, {
                        encoding: 'utf8'
                    });

                    if (!response.trim().length) {
                        return null;
                    }

                    response = response.trim();

                    return response.substring(0, response.lastIndexOf('\\'));

                case '*nix':
                    break;

                default:
                    return null;
            }
        } catch (e) {
            return null;
        }
    }

    static setPath(path) {
        try {
            switch (System.getOSType()) {
                case 'nt':
                    const pathToBatchFile = `${__dirname}${System.getPathSeparator()}..${System.getPathSeparator()}..${System.getPathSeparator()}bin${System.getPathSeparator()}setpath.bat`,
                        response = execSync(`"${pathToBatchFile}" "${path}" 2>&1`, {
                            encoding: 'utf8'
                        });

                    return {
                        successful: response.includes('SUCCESS'),
                        output: response.replace('SUCCESS:', '').replace('ERROR:', '').trim()
                    };

                case '*nix':
                    return {
                        successful: false,
                        output: '*nix systems are not currently supported..'
                    };

                default:
                    return {
                        successful: false,
                        output: 'Unknown OS.'
                    };
            }
        } catch (e) {
            return {
                successful: false,
                output: e.stdout || e.message
            }
        }
    }
}

module.exports = Process;
