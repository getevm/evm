const fs = require('fs');

const System = require('./System');
const path = require("path");

class PHPIni {
    constructor(pathToReleaseDir) {
        this.pathToReleaseDir = pathToReleaseDir;
        this.pathToIniFile = `${pathToReleaseDir}${System.getPathSeparator()}php.ini`;
    }

    getContents() {
        return fs.readFileSync(this.pathToIniFile, {
            encoding: 'utf8'
        });
    }

    enable() {
        try {
            if (fs.existsSync(`${this.pathToReleaseDir}${System.getPathSeparator()}php.ini-production`)) {
                fs.renameSync(`${this.pathToReleaseDir}${System.getPathSeparator()}php.ini-production`, this.pathToIniFile);
                return true;
            } else if (fs.existsSync(`${this.pathToReleaseDir}${System.getPathSeparator()}php.ini-development`)) {
                fs.renameSync(`${this.pathToReleaseDir}${System.getPathSeparator()}php.ini-development`, this.pathToIniFile);
                return true;
            } else {
                return false;
            }
        } catch (e) {
            return false;
        }
    }

    setCurlCAInfo(pathToCert) {
        const contents = this.getContents(),
            searches = [';curl.cainfo ='],
            replace = `curl.cainfo="${pathToCert}"`;

        let replaced = false;

        for (const search of searches) {
            if (contents.includes(search)) {
                fs.writeFileSync(this.pathToIniFile, contents.replace(search, replace), 'utf8');
                replaced = true;
                break;
            }
        }

        return replaced;
    }

    setOpenSslCAPath(pathToCert) {
        const contents = this.getContents(),
            searches = [';openssl.capath='],
            replace = `openssl.capath="${pathToCert}"`;

        let replaced = false;

        for (const search of searches) {
            if (contents.includes(search)) {
                fs.writeFileSync(this.pathToIniFile, contents.replace(search, replace), 'utf8');
                replaced = true;
                break;
            }
        }

        return replaced;
    }

    setExtensionDir() {
        switch (System.getOSType()) {
            case 'nt':
                const contents = this.getContents(),
                    searches = ['; extension_dir = "ext"', ';extension_dir = "ext"'],
                    replace = `extension_dir="${this.pathToReleaseDir}${System.getPathSeparator()}ext"`;

                let replaced = false;

                for (const search of searches) {
                    if (contents.includes(search)) {
                        fs.writeFileSync(this.pathToIniFile, contents.replace(search, replace), 'utf8');
                        replaced = true;
                        break;
                    }
                }

                return replaced;

            case '*nix':
                return null;

            default:
                return null;
        }
    }

    getExtensions() {
        switch (System.getOSType()) {
            case 'nt':
                let extensions = fs.readdirSync(`${this.pathToReleaseDir}${System.getPathSeparator()}ext`);

                extensions = extensions.map(extension => {
                    const cleanedExtensionName = extension.replace('php_', '').replace('.dll', '');

                    return {
                        name: cleanedExtensionName,
                        value: cleanedExtensionName
                    };
                });

                return extensions;

            case '*nix':
                return null;

            default:
                return null;
        }
    }

    enableExtensions(extensions) {
        const outcome = {
            enabled: [],
            failed: []
        };

        switch (System.getOSType()) {
            case 'nt':
                for (const extension of extensions) {
                    const contents = this.getContents(),
                        searches = [
                            `;extension=php_${extension}.dll`,
                            `;extension=php_${extension}`,
                            `;extension=${extension}`
                        ];

                    for (const search of searches) {
                        const replace = search.substring(1);

                        if (contents.includes(search)) {
                            fs.writeFileSync(this.pathToIniFile, contents.replace(search, replace), 'utf8');
                            outcome.enabled.push(extension);
                            break;
                        }
                    }

                    if (!outcome.enabled.includes(extension)) {
                        outcome.failed.push(extension);
                    }
                }
                return outcome;

            case '*nix':
                return null;

            default:
                return null;
        }
    }
}

module.exports = PHPIni;
