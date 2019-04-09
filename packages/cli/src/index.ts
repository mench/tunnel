import {ClientCli}   from "./ClientCli";
import {ServerCli}   from "./ServerCli";
import * as optimist from "optimist";
import {Paint}       from "./Paint";

class Cli {

    private node: string;
    private app: string;
    private command: string;

    constructor() {
        const [node, app, command] = process.argv;
        this.node = node;
        this.app = app;
        this.command = command;
    }

    async run() {
        console.clear();
        switch (this.command) {
            case 'serve':
                return Cli.serve();
            case 'connect':
                return Cli.connect();
            case '-v':
            case '-version':
            case '--version':
                console.log(Paint.bold("version: "), require('../package.json').version);
                break;
            default: {
                optimist.usage(`Usage: use ${Paint.bold("connect")} or ${Paint.bold("serve")} commands. Ex: tunnel connect [options]`)
                    .showHelp();
                process.exit();
            }
        }
    }

    static async connect() {
        const clientCli = new ClientCli();
        return clientCli.run();
    }

    static async serve() {
        const serverCli = new ServerCli();
        return serverCli.run();
    }
}

new Cli().run().catch(console.error);