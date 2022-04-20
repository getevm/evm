const Chalk = require('chalk');

class Output {
    static std(messages) {
        this.parseMessages(Chalk.white, messages);
    }

    static success(messages) {
        this.parseMessages(Chalk.green, messages);
    }

    static warning(messages) {
        this.parseMessages(Chalk.yellow, messages);
    }

    static error(messages) {
        this.parseMessages(Chalk.red, messages);
    }

    static parseMessages(type, messages) {
        messages = Array.isArray(messages) ? messages : [messages];

        messages.forEach((message) => {
            console.log(type(message));
        });
    }
}

module.exports = Output;
