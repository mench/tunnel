import * as optimist    from "optimist";
import {Config, Server} from "@tunnels/server";
import * as Fs          from 'fs';
import * as Path        from 'path';
import {Paint}          from "./Paint";

export class ServerCli {
    public options = optimist
        .usage('Command: serve [options]')
        .options('config', {
            default:'../../config.json',
            describe: 'config path'
        });

    private getAdminDir(){
        try {
            return Path.dirname(require.resolve('@tunnels/admin/build/index.html'));
        }catch (e) {
            return null;
        }
    }

    public async run(){
        const argv = this.options.argv;
        if( !argv.config ){
            this.help();
            console.error('config is required');
            process.exit();
        }
        const configPath = argv.config;
        const config = new Config();
        const dirname = Path.dirname(configPath);
        config.path = Path.resolve(configPath);
        config.admin = this.getAdminDir();
        Object.assign(config,JSON.parse(Fs.readFileSync(configPath, 'utf8')));

        if( config.ssl.enabled ){
            config.cert = Fs.readFileSync(Path.resolve(dirname,String(config.ssl.cert)));
            config.key = Fs.readFileSync(Path.resolve(dirname,String(config.ssl.key)));
        }
        const server = new Server(config);
        server.run();
        console.log(Paint.green('Server listening on port: '), Paint.bold(config.port));
        if( config.ssl.enabled ){
            console.log(Paint.green('Secure Server listening on port: '), Paint.bold(config.ssl.port));
        }
    }

    public help(){
        this.options.showHelp();
    }
}