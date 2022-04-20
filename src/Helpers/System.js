const os = require('os');
const path = require('path');

class System {
    static getPlatform() {
        return process.platform;
    }

    static getOSType() {
        return process.platform === 'win32' ? 'nt' : '*nix';
    }

    static getHomrDir() {
        return os.homedir();
    }

    static getTmpDir() {
        return os.tmpdir();
    }

    static getPathSeparator() {
        return path.sep;
    }
}

module.exports = System;
