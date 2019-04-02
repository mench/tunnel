import * as net                   from 'net';
import * as tls                   from 'tls';
import {Signal, signal}           from "@tunnel/common";
import {logger, LoggerInterface,} from "@tunnel/common";

export class Client {

    public serviceSocket: net.Socket;
    public relaySocket: net.Socket;
    protected bufferData: boolean;
    protected buffer: any[];

    @signal
    readonly onClose: Signal<() => any>;

    @signal
    readonly onPair: Signal<() => any>;

    @signal
    readonly onBytes: Signal<(d: { tx, rx }) => any>;

    @logger()
    readonly logger: LoggerInterface;

    constructor(protected opts = {
        host: null,
        port: null,
        relayHost: null,
        relayPort: null
    }, protected options:{[k:string]:any} = { tls: false }, index = 0) {
        this.logger.debug('constructor: %o', { opts, options });

        this.opts = opts;
        this.options = options;

        this.serviceSocket = undefined
        this.bufferData = true
        this.buffer = []

        this.relaySocket = this.options.tls ? this.createSecureRelaySocket() : this.createRelaySocket()
        this.relaySocket.on('data', this.onRelaySocketData.bind(this));
        this.relaySocket.on('end', () => this.onBytes({
            tx: this.relaySocket.bytesWritten,
            rx: this.relaySocket.bytesRead
        }));
        this.relaySocket.on('close', this.onRelaySocketClose.bind(this))
        this.relaySocket.on('error', this.onRelaySocketError.bind(this))
    }

    createRelaySocket() {
        this.logger.debug('relaySocket:create')
        const socket = new net.Socket()
        return socket.connect(this.opts.relayPort, this.opts.relayHost, this.onRelaySocketConnect.bind(this))
    }

    createSecureRelaySocket() {
        this.logger.debug('relaySocket:createSecure');
        return tls.connect(this.opts.relayPort, this.opts.relayHost, {
            rejectUnauthorized: undefined
        }, this.onRelaySocketConnect.bind(this))
    }

    onRelaySocketConnect() {
        this.logger.debug('relaySocket:onConnect');
    }

    onRelaySocketData(data) {
        this.logger.debug('relaySocket:onData')
        if (!this.serviceSocket) {
            this.onPair();
            this.createServiceSocket()
        }
        if (this.bufferData) {
            this.buffer[this.buffer.length] = data
        } else {
            this.serviceSocket.write(data)
        }
    }

    onRelaySocketClose(hadError) {
        this.logger.debug('relaySocket:onClose', { hadError })
        if (this.serviceSocket) {
            this.serviceSocket.destroy()
        } else {
            this.onClose();
        }
    }

    onRelaySocketError(error) {
        this.logger.debug('relaySocket:onError', error)
    }

    createServiceSocket() {
        this.logger.debug('serviceSocket:create');
        this.serviceSocket = new net.Socket();
        this.serviceSocket.connect(this.opts.port, this.opts.host, this.onServiceSocketConnect.bind(this))
        this.serviceSocket.on('data', this.onServiceSocketData.bind(this))
        this.serviceSocket.on('error', this.onServiceSocketError.bind(this))
    }

    onServiceSocketConnect() {
        this.logger.debug('serviceSocket:onConnect')
        this.bufferData = false
        if (this.buffer.length > 0) {
            for (let i = 0; i < this.buffer.length; i++) {
                this.serviceSocket.write(this.buffer[i])
            }
            this.buffer.length = 0
        }
    }

    onServiceSocketData(data) {
        this.logger.debug('serviceSocket:onData')
        try {
            this.relaySocket.write(data)
        } catch (err) {
            this.logger.debug('serviceSocket:onData:writeError', err)
        }
    }

    onServiceSocketError(error) {
        this.logger.debug('serviceSocket:onError', error)
        this.relaySocket.end()
    }
}
