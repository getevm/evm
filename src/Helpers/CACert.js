const fs = require('fs');

const File = require('../Filesystem/File');
const System = require('./System');

class CACert {
    static async download() {
        const url = `https://curl.haxx.se/ca/cacert.pem`;

        try {
            return await File.download(url);
        } catch (e) {
            return null;
        }
    }

    static store(path, cert) {
        try {
            if (!fs.existsSync(path)) {
                fs.mkdirSync(path, {
                    recursive: true
                });
            }

            fs.writeFileSync(`${path}${System.getPathSeparator()}cacert.pem`, cert);

            return true;
        } catch (e) {
            return false;
        }
    }
}

module.exports = CACert;
