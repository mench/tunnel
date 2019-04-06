import {ClientCli}   from "./ClientCli";
import {ServerCli}   from "./ServerCli";
import * as optimist from "optimist";

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
        switch (this.command) {
            case 'serve':
            return await Cli.serve();
            case 'connect':
                return await Cli.connect();
            default:{
                optimist.usage('Usage: use "connect" or "serve" commands. Ex: tunnel connect [options]')
                    .showHelp();
                process.exit();
            }
        }
    }

    static async connect() {
        const clientCli = new ClientCli();
        return clientCli.run();
    }

    static async serve(){
        const serverCli = new ServerCli();
        return serverCli.run();
    }
}

new Cli().run().catch(console.error);