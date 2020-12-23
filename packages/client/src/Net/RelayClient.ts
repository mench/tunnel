import {Signal, signal}           from "@relcu/tunnel-common";
import {logger, LoggerInterface,} from "@relcu/tunnel-common";
import {Client}                   from "./Client";

export class RelayClient {

    @logger()
    readonly logger: LoggerInterface;

    public retry:boolean;
    public pairCount:number;
    public endCalled:boolean;
    public bytes:{tx, rx};
    public client:Client;

    constructor(protected opts = {
        host: null,
        port: null,
        relayHost: null,
        relayPort: null
    }, protected options:{[k:string]:any} = {
        retry: false
    }) {

        this.logger.debug('constructor: %o', { opts, options });
        this.retry = options.retry || true

        this.pairCount = 0;
        this.bytes = { tx: 0, rx: 0 };
        this.client = this.createClient()
    }

    get status() {
        return {
            pairCount: this.pairCount,
            bytes: this.bytes,
            client: !!this.client,
            relaySocket: !!Object(this.client).relaySocket,
            serviceSocket: !!Object(this.client).serviceSocket
        }
    }

    createClient() {
        const client = new Client(this.opts, this.options);
        client.onPair.attach(this.onClientPair.bind(this));
        client.onClose.attach(this.onClientClose.bind(this));
        client.onBytes.attach(this.onClientBytes.bind(this));
        return client
    }

    onClientPair() {
        this.pairCount += 1
        this.logger.debug('onClientPair', { pairCount: this.pairCount })
        this.client = this.createClient()
    }

    onClientClose() {
        this.logger.debug('onClientClose', { endCalled: this.endCalled, retry: this.retry });
        this.client.onClose.detachAll();
        this.client.onBytes.detachAll();
        this.client.onPair.detachAll();
        this.client = null;

        // Reconnect on connection loss
        if (this.retry) {
            setTimeout(() => {
                if (this.endCalled) {
                    return
                }
                this.client = this.createClient();
            }, 5000)
        }
    }

    onClientBytes({ tx = 0, rx = 0 }) {
        this.bytes.tx += tx;
        this.bytes.rx += rx;
        this.logger.debug('onClientBytes: %o', this.bytes)
    }

    end() {
        this.logger.debug('end', { endCalled: this.endCalled })
        this.endCalled = true;
        try {
            if( this.client ){
                this.client.onClose.detachAll();
                this.client.onBytes.detachAll();
                this.client.onPair.detachAll();
                this.client.relaySocket.destroy()
            }

        } catch (err) {
            this.logger.debug('end:error: %o', err)
        }
    }
}
