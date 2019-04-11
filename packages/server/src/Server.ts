import * as http                 from 'http';
import * as https                from 'https';
import {logger, LoggerInterface} from "@tunnels/common";
import {TunnelManager}           from "./TunnelManager";
import {Config}                  from "./Config";
import * as httpProxy            from 'http-proxy';
import {Pattern}                 from "@tunnels/common";
import {writeJson}               from "@tunnels/common";
import {ProxyRequests}           from "./ProxyRequests";
import * as WebSocket            from "ws"
import {UnauthorizedError}       from "./Error/UnauthorizedError";
import {HttpError}               from "./Error/HttpError";
import * as statics              from 'node-static';


export class Server {

    @logger()
    readonly logger: LoggerInterface;

    protected server: http.Server = null;
    protected secureServer: https.Server = null;
    public proxy: httpProxy = null;
    public manager: TunnelManager;
    public config: Config;
    public routes: Pattern<any>[];
    public proxyRequests: ProxyRequests;
    public wss: WebSocket.Server;
    public statics: statics.Server;

    constructor(config: Config) {
        this.config = config;
        this.manager = new TunnelManager();
        this.proxy = httpProxy.createProxyServer({ ws: true });
        this.proxy.on('error',this.doError);
        this.wss = new WebSocket.Server({
            noServer: true,
            perMessageDeflate: {
                zlibDeflateOptions: {
                    chunkSize: 1024,
                    memLevel: 7,
                    level: 3
                },
                clientNoContextTakeover: true, // Defaults to negotiated value.
                serverNoContextTakeover: true, // Defaults to negotiated value.
                serverMaxWindowBits: 10, // Defaults to negotiated value.
                concurrencyLimit: 10, // Limits zlib concurrency for perf.
                threshold: 1024 // Size (in bytes) below which messages
                // should not be compressed.
            }
        });
        this.proxyRequests = new ProxyRequests(this);
        if( this.config.admin ){
            this.statics = new statics.Server(this.config.admin);
        }

        this.routes = [
            Pattern.regexp(`/api/tunnels/:id`, {
                get: this.doRegister.bind(this)
            }),
            Pattern.regexp(`/api/tunnels/:id`, {
                delete: this.doRemove.bind(this)
            }),
            Pattern.regexp(`/api/tunnels`, {
                get: this.getTunnels.bind(this)
            })
        ]
    }

    public run() {
        const { port, ssl, cert, key } = this.config;
        this.server = http.createServer();
        this.server.on('error',this.doError.bind(this));
        this.server.on('request', this.doRequest.bind(this));
        this.server.on('upgrade', this.doUpgrade.bind(this));
        this.server.listen(port, this.config.address);
        if (ssl.enabled) {
            this.secureServer = https.createServer({
                key: key,
                cert: cert
            });
            this.secureServer.on('request', this.doRequest.bind(this));
            this.secureServer.on('upgrade', this.doUpgrade.bind(this));
            this.secureServer.on('error',this.doError.bind(this));
            this.secureServer.listen(ssl.port,this.config.address);
        }
        return this
    }

    async doError(err:Error,req: http.IncomingMessage, res: http.ServerResponse){
        console.error(err.message,req.headers['host']);
        if( res instanceof http.ServerResponse ){
            res.writeHead(502);
            res.end('Bad Gateway');
        }
    }

    get id(): Pattern<any> {
        return Pattern.regexp(`:subdomain.${this.config.domain}`, null);
    }

    public getTunnelByHost(host: string) {
        let matched = String(this.hostname(host)).match(this.id);
        if (matched) {
            return this.manager.getTunnel(matched[1]);
        }
    }

    public getProxyUrl(internetPort) {
        const { domain } = this.config;
        return `${domain}:${internetPort}`;
    }

    protected basicAuth(req: http.IncomingMessage) {
        const auth = req.headers['authorization'];
        if (!auth) {
            throw new UnauthorizedError();
        }
        const decode = (auth: string) => {
            return Buffer.from(auth.split(' ')[1], 'base64')
                .toString()
                .split(':');
        };
        const { users } = this.config;
        const [username, password] = decode(String(auth));
        if (users[username] === password) {
            return username;
        }
        throw new UnauthorizedError();
    }

    async doRequest(req: http.IncomingMessage, res: http.ServerResponse) {
        if (this.hostname(req.headers.host) === this.config.domain) {
            try {
                const result = await this.route(req);
                if (result) {
                    writeJson(res, 200, result);
                } else {
                    if( this.statics ){
                        this.statics.serve(req,res);
                    }else{
                        throw new HttpError(404,'Not found')
                    }
                }
            } catch (e) {
                if (e instanceof UnauthorizedError) {
                    writeJson(res, 401, {
                        error: 'Invalid Credentials'
                    }, {
                        'WWW-Authenticate': `Basic realm="${this.config.domain}", charset="UTF-8"`,
                    });
                } else if (e instanceof HttpError) {
                    writeJson(res, e.httpCode, {
                        status: e.httpCode,
                        error: e.message
                    });
                } else {
                    writeJson(res, 400, {
                        status: 400,
                        error: e.message
                    });
                }
            }
        } else {
            let tunnel = this.getTunnelByHost(req.headers.host);
            if (tunnel) {
                this.proxy.web(req, res, { target: `http://${this.getProxyUrl(tunnel.internetPort)}` })
            } else {
                res.writeHead(502);
                res.end('Bad Gateway');
            }
        }
    }

    protected doUpgrade(req, socket, head) {
        if (this.hostname(req.headers.host) === this.config.domain) {
            const auth = this.proxyRequests.authorize(req);
            if (!auth) {
                socket.destroy();
            } else {
                this.wss.handleUpgrade(req, socket, head, (ws) => {
                    this.wss.emit('connection', ws, req, auth);
                });
            }
        } else {
            let tunnel = this.getTunnelByHost(req.headers.host);
            if (tunnel) {
                this.proxy.ws(req, socket, head, { target: `ws://${this.getProxyUrl(tunnel.internetPort)}` })
            } else {
                socket.destroy();
            }
        }
    };

    async doRegister(subdomain: string, username) {
        let tunnel = this.manager.getTunnel(subdomain);
        if (tunnel) {
            throw new Error('already connected')
        }
        tunnel = await this.manager.newTunnel(subdomain, username);
        const json = tunnel.toJSON();
        this.proxyRequests.broadcast('create:tunnel', json);
        return json;
    }

    async doRemove(subdomain: string) {
        let tunnel = this.manager.getTunnel(subdomain);
        if (tunnel) {
            this.manager.remove(subdomain);
            this.proxyRequests.broadcast('remove:tunnel', tunnel.toJSON());
        }
        return {};
    }

    async getTunnels() {
        return this.manager.toJSON();
    }

    async route(req: http.IncomingMessage) {
        const method = req.method.toLocaleLowerCase();
        const path = req.url;
        for (const r of this.routes) {
            let matched = path.match(r);
            if (matched) {
                let [full, ...params] = matched;
                if (r.meta[method]) {
                    return await r.meta[method](...params, this.basicAuth(req));
                }
            }
        }
    }

    hostname = (host) => {
        return String(host).split(":")[0]
    };

    public close() {
        this.proxy.close();
        this.manager.removeAll();
        this.server.close();
        if (this.secureServer) {
            this.secureServer.close();
        }
        this.logger.debug('closed');
    }
}
