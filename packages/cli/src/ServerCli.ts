import * as optimist    from "optimist";
import {Config, Server} from "@tunnels/server";
import * as Fs from 'fs';
import * as Path from 'path';

export class ServerCli {
    public options = optimist
        .usage('Command: serve [options]')
        .options('config_dir', {
            default:'../../config.json',
            describe: 'config path'
        });

    public async run(){
        const argv = this.options.argv;
        if( !argv.config_dir ){
            this.help();
            console.error('config_dir is required');
            process.exit();
        }
        const configPath = argv.config_dir;
        const config = new Config();
        const dirname = Path.dirname(configPath);
        Object.assign(config,JSON.parse(Fs.readFileSync(configPath, 'utf8')));

        if( config.ssl.enabled ){
            config.ssl.cert = Fs.readFileSync(Path.resolve(dirname,String(config.ssl.cert)));
            config.ssl.key = Fs.readFileSync(Path.resolve(dirname,String(config.ssl.key)));
        }
        const server = new Server(config);
        await server.run();
    }

    public help(){
        this.options.showHelp();
    }
}