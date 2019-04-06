import {logger, LoggerInterface} from "@tunnels/common";
import {Socket}                  from 'net';
import {signal}                  from "@tunnels/common";
import {Signal}                  from "@tunnels/common";


export class Client {

    @logger()
    readonly logger: LoggerInterface;

    @signal
    readonly onClose:Signal<()=>any>;

    public socket: Socket;
    public buffer: any[];
    public pairedSocket: any;

    constructor(opts = { socket: null }, private options: { bufferData?: any, timeout?: any } = {}) {

        this.logger.debug('constructor: %o', { options });

        this.socket = opts.socket;
        this.options = options;

        if (options.bufferData) {
            this.buffer = []
        }
        this.pairedSocket = undefined;
        this.timeout();

        this.socket.on('data', this.onSocketData.bind(this))
        this.socket.on('close', this.onSocketClose.bind(this))
    }

    onSocketData(data) {
        this.logger.debug('socket:onData', { bufferData: this.options.bufferData });
        if (this.options.bufferData) {
            this.buffer[this.buffer.length] = data
            this.logger.debug('socket:onData - data', { bufferLength: this.buffer.length })
            return;
        }
        try {
            this.pairedSocket.write(data)
        } catch (err) {
            this.logger.error('socket:onData:writeError', err)
        }
    }

    onSocketClose(hadError) {
        this.logger.debug('socket:onClose', { hadError, pairedSocket: !!this.pairedSocket })
        if (this.pairedSocket !== undefined) {
            this.pairedSocket.destroy()
        }
        this.onClose();
    }

    timeout() {
        this.logger.debug('timeout', { timeout: this.options.timeout })
        if (!this.options.timeout) {
            return
        }
        setTimeout(() => {
            this.logger.debug('timeout:setTimeout', { bufferData: !!this.options.bufferData })
            if (this.options.bufferData) {
                this.socket.destroy()
                this.onClose();
            }
        }, this.options.timeout)
    }

    writeBuffer() {
        this.logger.debug('writeBuffer')
        if (this.options.bufferData && this.buffer.length > 0) {
            try {
                for (let i = 0; i < this.buffer.length; i++) {
                    this.pairedSocket.write(this.buffer[i])
                }
            } catch (ex) {
            }
            this.buffer.length = 0
        }
        this.options.bufferData = false
    }
}
