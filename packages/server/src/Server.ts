import * as http                 from 'http';
import * as https                from 'https';
import {logger, LoggerInterface} from "@tunnel/common";
import {TunnelManager}           from "./TunnelManager";
import {Config}                  from "./Config";
import * as httpProxy            from 'http-proxy';
import {Pattern}                 from "@tunnel/common";
import {writeJson}               from "@tunnel/common";

export class Server {

    @logger()
    readonly logger: LoggerInterface;

    protected server: http.Server = null;
    protected secureServer: https.Server = null;
    protected proxy: httpProxy = null;
    public manager: TunnelManager;
    public config: Config;
    public routes: Pattern<any>[];

    constructor(config: Config) {
        this.config = config;
        this.manager = new TunnelManager(config);
        this.proxy = httpProxy.createProxyServer({ ws: true });
        this.routes = [
            Pattern.regexp(`/api/tunnels/:id`, {
                get: this.doRegister.bind(this)
            }),
            Pattern.regexp(`/api/tunnels`, {
                get: this.getTunnels.bind(this)
            })
        ]
    }

    public run() {
        const { port, ssl } = this.config;
        this.server = http.createServer();
        this.server.on('request', this.doRequest.bind(this));
        this.server.on('upgrade', this.doUpgrade.bind(this));
        this.server.listen(port, this.config.address);
        console.log('Server listening on port', this.config.port);
        if (ssl.enabled) {
            this.secureServer = https.createServer({
                key: ssl.key,
                cert: ssl.cert
            });
            this.secureServer.listen(ssl.port);
            console.log('Secure server listening on port', this.config.ssl.port);
        }
        return this
    }

    get id(): Pattern<any> {
        return Pattern.regexp(`:subdomain.${this.config.domain}`, null);
    }

    private getTunnelByHost(host: string) {
        let matched = String(host).match(this.id);
        if (matched) {
            return this.manager.getTunnel(matched[1]);
        }
    }

    public getProxyUrl(internetPort) {
        const { ssl, domain } = this.config;
        return `http${ssl.enabled ? 's':''}://${domain}:${internetPort}`;
    }

    async doRequest(req: http.IncomingMessage, res: http.ServerResponse) {
        if (req.headers.host === this.config.domain) {
            const result = await this.route(req.method, req.url, req.headers);
            console.info(result)
            if (result) {
                writeJson(res, 200, result);
            } else {
                writeJson(res, 404, {
                    status: 404,
                    error: 'Not Found'
                });
            }
        } else {
            let tunnel = this.getTunnelByHost(req.headers.host);
            if (tunnel) {
                this.proxy.web(req, res, { target: this.getProxyUrl(tunnel.internetPort) })
            } else {
                res.writeHead(502);
                res.end('Bad Gateway')
            }
        }
    }

    protected doUpgrade(req, socket, head) {
        if (req.headers.host === this.config.domain) {
           //TODO own socket
        } else {
            let tunnel = this.getTunnelByHost(req.headers.host);
            if (tunnel) {
                this.proxy.ws(req, socket,head,{ target: this.getProxyUrl(tunnel.internetPort) })
            } else {
                socket.destroy();
            }
        }
    };

    async doRegister(subdomain: string) {
        let tunnel = this.manager.getTunnel(subdomain);
        if (!tunnel) {
            tunnel = await this.manager.newTunnel(subdomain);
        }
        return tunnel.toJSON();
    }

    async getTunnels() {
        const tunnels = [];
        this.manager.tunnels.forEach(tunnel=>{
            tunnels.push(tunnel.toJSON());
        });
        return tunnels;
    }

    async route(method: string, path: string, headers) {
        method = method.toLocaleLowerCase();
        for (const r of this.routes) {
            let matched = path.match(r);
            if (matched) {
                let [full, ...params] = matched;
                return await r.meta[method](...params);
            }
        }
    }

    public close() {
        this.manager.removeAll();
        this.server.close();
        this.logger.debug('closed');
    }
}
