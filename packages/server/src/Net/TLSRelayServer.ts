import * as fs                   from 'fs';
import * as tls                  from 'tls';
import {RelayServer}             from "./RelayServer";
import {Listener}                from "./Listener";
import {logger, LoggerInterface} from "@relcu/tunnel-common";

export class TLSInternetListener extends Listener {

    @logger()
    readonly logger: LoggerInterface;

    createServer() {
        const opts = this.options.internetListener;
        if (!opts || !opts.tlsOptions || !opts.tlsOptions.key) {
            this.logger.debug('Warning, insufficient options: %o', opts);
            return super.createServer();
        }
        try {
            const getFile = (file) => (file instanceof Buffer) ? file : fs.readFileSync(file)
            const tlsOptions = {
                key: getFile(this.options.internetListener.tlsOptions.key),
                cert: getFile(this.options.internetListener.tlsOptions.cert)
            };
            return tls.createServer(tlsOptions, (socket) => {
                this.createClient(socket)
            })
        } catch (err) {
            this.logger.debug('Warning, an error occured:', err)
            return super.createServer()
        }
    }
}

export class TLSRelayServer extends RelayServer {

    createInternetListener() {
        return new TLSInternetListener(
            { port: this.internetPort },
            {
                internetListener: this.options.internetListener,
                hostname: this.options.hostname,
                bufferData: true,
                timeout: this.options.timeout || 20000
            }
        )
    }
}

