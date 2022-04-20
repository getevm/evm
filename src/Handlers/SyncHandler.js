const fs = require('fs');

const Output = require('../Console/Output');
const File = require('../Filesystem/File');

class SyncHandler {
    async execute() {
        const PATH_TO_REMOTE_VERSION_FILE = `https://getevm.github.io/versions/php.json`;

        let remoteVersions = await File.download(PATH_TO_REMOTE_VERSION_FILE, {
            responseType: 'text'
        });

        if (!remoteVersions) {
            Output.error(`Failed to download version file.`)
            return;
        }

        remoteVersions = JSON.stringify(remoteVersions);

        if (fs.existsSync(File.getPathToLocalVersionFile())) {
            const localVersions = fs.readFileSync(File.getPathToLocalVersionFile(), {encoding: 'utf8'});

            if (remoteVersions === JSON.stringify(JSON.parse(localVersions))) {
                Output.success('No changes detected to synchronise.');
                return;
            }
        }

        fs.writeFileSync(File.getPathToLocalVersionFile(), remoteVersions, {
            encoding: 'utf8'
        });

        Output.success(`Local version file synchronised with remote file`);
    }
}

module.exports = SyncHandler;
