import * as optimist    from "optimist";
import {Config, Server} from "@tunnels/server";
import * as Fs          from 'fs';
import * as Path        from 'path';
import {Paint}          from "./Paint";
import {homedir}        from "os"

export class ServerCli {
    public options = optimist
        .usage('Command: serve [options]')
        .options('d', {
            alias: 'domain',
            default: 'mamble.io',
            describe: 'tunnels domain to use',
        })
        .options('config', {
            describe: 'config path'
        });

    private getAdminDir() {
        try {
            return Path.dirname(require.resolve('@tunnels/admin/build/index.html'));
        } catch (e) {
            return null;
        }
    }

    public async run() {
        const argv = this.options.argv;
        const configPath = Path.resolve(argv.config || `${homedir()}/tunnel.${argv.domain}.json`);

        if (!Fs.existsSync(configPath)) {
            this.help();
            console.error('config is required');
            process.exit();
        }

        const config = new Config();
        const dirname = Path.dirname(configPath);
        config.path = Path.resolve(configPath);
        config.admin = this.getAdminDir();
        Object.assign(config, JSON.parse(Fs.readFileSync(configPath, 'utf8')));

        if (config.ssl.enabled) {
            config.cert = Fs.readFileSync(Path.resolve(dirname, String(config.ssl.cert)));
            config.key = Fs.readFileSync(Path.resolve(dirname, String(config.ssl.key)));
        }
        const server = new Server(config);
        server.run();
        console.log(Paint.green('HTTP: '), Paint.bold(config.port));
        console.log(Paint.green('URL: '), `http://${config.domain}`);
        if (config.ssl.enabled) {
            console.log(Paint.green('HTTPS: '), Paint.bold(config.ssl.port));
            console.log(Paint.green('URL: '), `https://${config.domain}`);
        }
    }

    public help() {
        this.options.showHelp();
    }
}