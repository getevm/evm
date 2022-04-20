const fs = require('fs');
const path = require('path');

const axios = require('axios');
const inquirer = require('inquirer');

const Output = require('../Console/Output');
const File = require('../Filesystem/File');
const System = require('../Helpers/System');
const Process = require('../Helpers/Process');
const PHPIni = require('../Helpers/PHPIni');
const CACert = require('../Helpers/CACert');

class InstallHandler {
    constructor(config) {
        this.config = config;

        this.execute();
    }

    async execute() {
        Output.std([
            '-----------------------------------------------------',
            `Version: ${this.config.version}`,
            `Architecture: ${this.config.archType}`,
            `Thread Safe: ${this.config.threadSafe ? 'Yes' : 'No'}`,
            '-----------------------------------------------------'
        ]);

        Output.std('Attempting to find requested release...');

        const releaseUrl = this.getReleaseUrl();

        if (!releaseUrl) {
            Output.error('Failed to find release.')
            return;
        }

        Output.std(`Release found. Attempting to download it from ${releaseUrl}`);

        const release = await this.download(releaseUrl);

        if (!release) {
            Output.error('Failed to download release');
            return;
        }

        const releaseFileName = path.basename(releaseUrl);
        const pathToReleaseDir = `${File.getPathToInstallationDir()}${System.getPathSeparator()}${this.buildReleaseDirName()}`;
        const pathToArchive = `${pathToReleaseDir}${System.getPathSeparator()}${releaseFileName}`;

        if (fs.existsSync(pathToReleaseDir)) {
            /**
             * - Check if installation path is active php instance
             * - If so, fail
             */
        } else {
            fs.mkdirSync(pathToReleaseDir, {
                recursive: true
            });
        }

        fs.writeFileSync(pathToArchive, release);

        Output.success(`Downloaded release to ${pathToArchive}. Attempting to unzip.`);

        /***************************************
         * Attempt to unzip release and cleanup
         ***************************************/
        if (!Process.unzip(pathToArchive, pathToReleaseDir, true)) {
            File.rrmdir(pathToReleaseDir);
            Output.error(`Failed to unzip release.`);
            return;
        }

        Output.success(`Unzipped release to ${pathToReleaseDir}`);

        const phpIni = new PHPIni(pathToReleaseDir);

        if (!phpIni.enable()) {
            Output.error(`Failed to enable php.ini file.`);
            return;
        }

        Output.success('Enabled php.ini. Attempting to download CA Cert.');

        /*********************************************************
         * Attempt to download and store the CA Cert for php.ini
         *********************************************************/
        const cacert = await CACert.download();

        let isExtensionDirSet = false;

        if (cacert) {
            let pathToCert = `${pathToReleaseDir}${System.getPathSeparator()}ssl`;

            if (CACert.store(pathToCert, cacert)) {
                pathToCert += `${System.getPathSeparator()}cacert.pem`;

                Output.success(`CA Cert stored to ${pathToCert}`);

                /*********************************
                 * Attempt to set the curl.cainfo
                 *********************************/
                if (phpIni.setCurlCAInfo(pathToCert)) {
                    Output.success(`Set curl.cainfo in php.ini.`);
                } else {
                    Output.warning(`Failed to set curl.cainfo in php.ini.`);
                }

                /************************************
                 * Attempt to set the openssl.cafile
                 ************************************/
                if (phpIni.setOpenSslCAPath(pathToCert)) {
                    Output.success(`Set openssl.capath in php.ini.`);
                } else {
                    Output.warning(`Failed to set openssl.capath in php.ini.`);
                }

                if (phpIni.setExtensionDir()) {
                    isExtensionDirSet = true;
                    Output.success('Set extension_dir in php.ini.');
                } else {
                    Output.warning(`Unable to set extension_dir. Skipping extension setup.`)
                }
            } else {
                Output.warning(`Failed to store the CA Cert. You'll need to do this manually.`);
            }
        } else {
            Output.warning(`Failed to download the CA Cert. You'll need to do this manually.`);
        }

        if (isExtensionDirSet) {
            const extensionList = phpIni.getExtensions();

            if (extensionList) {
                try {
                    const {extensions} = await inquirer.prompt([
                        {
                            type: 'checkbox',
                            name: 'extensions',
                            message: 'Do wish to enable extensions?',
                            choices: extensionList,
                            loop: false
                        }
                    ]);

                    if (extensions.length) {
                        const outcome = phpIni.enableExtensions(extensions);

                        if (typeof outcome === 'object') {
                            if (outcome.enabled.length) {
                                Output.success(`Enabled extensions: ${outcome.enabled.join(', ')}`);
                            }

                            if (outcome.failed.length) {
                                Output.error(`Failed to enable extensions: ${outcome.failed.join(', ')}`);
                            }
                        } else {
                            Output.warning('Failed to enable extensions. Skipping.');
                        }
                    } else {
                        Output.warning(`No extensions selected. Skipping.`);
                    }
                } catch (e) {

                }
            } else {
                Output.warning('Unable to find extensions. Skipping.');
            }
        }


    }

    buildReleaseDirName() {
        let name = this.config.version;
        name += this.config.threadSafe ? '-ts' : '-nts';
        name += `-${this.config.archType}`;
        name += `-${System.getOSType()}`;

        return name;
    }

    async download(release) {
        try {
            const response = await axios.get(release, {
                responseType: 'arraybuffer'
            });

            return response.data;
        } catch (e) {
            return null;
        }
    }

    getMetadataFromReleaseName(release) {
        const isNts = release.includes('-nts-');

        switch (System.getOSType()) {
            case 'nt':
                var ext = 'zip';

                const fileName = path.basename(release, '.zip');

                if (['x64', 'x86'].includes(fileName)) {
                    if (isNts) {
                        var [version, nts] = fileName.split('-');
                    } else {
                        var [version] = fileName.split('-');

                    }
                } else {
                    if (isNts) {
                        var [, version, nts, , , archType] = fileName.split('-');
                    } else {
                        var [, version, , , archType] = fileName.split('-');
                    }
                }


                return {
                    version,
                    threadSafe: typeof nts === 'undefined',
                    archType: archType || null,
                    ext
                }

            case '*nix':
                return null;

            default:
                return null;
        }
    }

    getReleasesFilePath() {
        return `${__dirname}${System.getPathSeparator()}..${System.getPathSeparator()}..${System.getPathSeparator()}data${System.getPathSeparator()}php.json`;
    }

    getReleaseUrl() {
        try {
            const releases = JSON.parse(fs.readFileSync(this.getReleasesFilePath(), 'utf8'));

            switch (System.getOSType()) {
                case 'nt':
                    const release = releases['nt'].filter(release => {
                        const {version, threadSafe, archType, ext} = this.getMetadataFromReleaseName(release);

                        return version === this.config.version &&
                            threadSafe === this.config.threadSafe &&
                            (archType === null || archType === this.config.archType)
                    }).filter(r => r)[0];

                    if (!release) {
                        return null;
                    }

                    return `https://windows.php.net/downloads/releases/archives/${release}`;

                case '*nix':
                    break;

                default:
                    return null;
            }
        } catch (e) {
            return null;
        }
    }
}

module.exports = InstallHandler;