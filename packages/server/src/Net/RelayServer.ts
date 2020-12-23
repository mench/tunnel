import {logger, LoggerInterface} from "@relcu/tunnel-common";
import {Listener}                from "./Listener";

export class RelayServer {

    @logger()
    readonly logger: LoggerInterface;

    public relayPort:number;
    public internetPort:number;
    public relayListener:Listener;
    public internetListener:Listener;

    constructor(opts = { relayPort: null, internetPort: null },protected options:{
        relayPort?: number, internetPort?: number,
        internetListener?:any,
        hostname?:string,
        timeout?:any,
    } = {}) {
        
        this.logger.debug('constructor: %o', { opts, options })

        this.relayPort = opts.relayPort;
        this.internetPort = opts.internetPort;
        this.options = options;

        this.relayListener = this.createRelayListener();
        this.internetListener = this.createInternetListener();

        this.relayListener.onNew.attach(this.onNewRelayListenerClient.bind(this))
        this.internetListener.onNew.attach(this.onNewInternetListenerClient.bind(this))
    }

    createRelayListener() {
        return new Listener(
            { port: this.relayPort },
            { ...this.options }
        )
    }

    createInternetListener() {
        return new Listener(
            { port: this.internetPort },
            {
                internetListener: this.options.internetListener,
                hostname: this.options.hostname,
                bufferData: true,
                timeout: this.options.timeout || 20000
            }
        )
    }

    onNewRelayListenerClient(client) {
        this.logger.debug('relayListener:onNewClient', { client: !!client });
        this.internetListener.pair(this.relayListener, client);
    }

    onNewInternetListenerClient(client) {
        this.logger.debug('internetListener:onNewClient', { client: !!client });
        this.relayListener.pair(this.internetListener, client);
    }

    end() {
        this.relayListener.end();
        this.internetListener.end();
    }
}

module.exports = { RelayServer }
