const fs = require('fs');
const System = require('./System');
const axios = require('axios');

class CACert {
    static async download() {
        const url = `https://curl.haxx.se/ca/cacert.pem`;

        try {
            const response = await axios.get(url, {
                responseType: 'arraybuffer'
            });

            return response.data;
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
