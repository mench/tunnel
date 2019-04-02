import * as fs                   from 'fs';
import * as net                  from 'net';
import * as tls                  from 'tls';
import {Signal, signal}          from "@tunnel/common";
import {logger, LoggerInterface} from "@tunnel/common";
import {Server}                  from 'net';
import {Client}                  from "./Client";

export class Listener {

    protected port: number;
    protected pending: Client[];
    protected active: any[];
    protected server:Server;

    @logger()
    readonly logger: LoggerInterface;

    @signal
    readonly onNew: Signal<(client:Client) => any>;

    constructor(opts = { port: null },protected options:{
        tls?:boolean;
        hostname?:string;
        passphrase?:any;
        pfx?:any;
        secret?:any;
        bufferData?:any;
        timeout?:any;
        internetListener?:any;
    } = { bufferData :true }) {
        this.logger.debug('constructor: %o', { opts, options })

        this.port = opts.port;
        this.options = options;

        this.pending = [];
        this.active = [];

        this.server = this.createServer();
        this.server.listen(this.port, this.options.hostname)
    }

    createServer() {
        this.logger.debug('createServer', { tls: this.options.tls })
        let server = null;

        if (this.options.tls === true) {
            const tlsOptions = {
                pfx: fs.readFileSync(this.options.pfx),
                passphrase: this.options.passphrase
            };
            server = tls.createServer(tlsOptions, (socket) => {
                this.createClient(socket)
            })
        } else {
            server = net.createServer((socket) => {
                this.createClient(socket)
            })
        }
        return server
    }

    createClient(socket) {
        this.logger.debug('createClient', { socket: !!socket, timeout: this.options.timeout })
        const client = new Client(
            { socket },
            {
                bufferData: this.options.bufferData,
                timeout: this.options.timeout
            }
        );

        client.onClose.attach(() => this.onClientClose(client));

        this.onNew(client);
    }

    onClientClose(client) {
        this.logger.debug('client:onClose', { pending: this.pending.length })
        let i = this.pending.indexOf(client);
        if (i !== -1) {
            this.pending.splice(i, 1)
        } else {
            i = this.active.indexOf(client);
            if (i !== -1) {
                this.active.splice(i, 1)
            }
        }
    }

    end() {
        this.logger.debug('end')
        this.server.close();
        for (let i = 0; i < this.pending.length; i++) {
            const client = this.pending[i]
            client.socket.destroy()
        }
        for (let i = 0; i < this.active.length; i++) {
            const client = this.active[i];
            client.socket.destroy()
        }
        this.server.unref()
    }

    pair(other, client) {
        this.logger.debug('pair', { pending: this.pending.length });
        if (this.pending.length > 0) {
            var thisClient = this.pending[0]
            this.pending.splice(0, 1);
            client.pairedSocket = thisClient.socket;
            thisClient.pairedSocket = client.socket;
            this.active[this.active.length] = thisClient
            other.active[other.active.length] = client;
            client.writeBuffer();
            thisClient.writeBuffer()
        } else {
            other.pending.push(client)
        }
    }
}