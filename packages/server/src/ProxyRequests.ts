import {Server}       from "./Server";
import * as WebSocket from 'ws'
import * as Http      from 'http';
import * as Https     from 'https';
import {URL}          from 'url';

export class ProxyRequests {

    private requests = new WeakMap();

    public logs = [];

    constructor(protected server: Server) {
        this.server.proxy.on('proxyReq', this.doProxyReq.bind(this));
        this.server.proxy.on('proxyRes', this.doProxyRes.bind(this));
        this.server.wss.on('connection', this.doWsConnect.bind(this));
    }

    public authorize(request) {
        const params = (): any => {
            let q = request.url.split('?'), result = {};
            if (q.length >= 2) {
                q[1].split('&').forEach((item) => {
                    try {
                        result[item.split('=')[0]] = item.split('=')[1];
                    } catch (e) {
                        result[item.split('=')[0]] = '';
                    }
                })
            }
            return result;
        };
        const { username, password } = params();
        if (!username) {
            return false;
        }
        if (!password) {
            return false;
        }
        if (this.server.config.users[username] !== password) {
            return false;
        }
        return username;
    }

    protected doWsConnect(ws, request, username) {
        try {
            const tunnels = this.server.manager.toJSON();
            ws.send(JSON.stringify({
                event: "welcome",
                data: {
                    session: {
                        id: username,
                        domain: this.server.config.domain
                    },
                    users: this.server.config.getUserNames(),
                    tunnels: tunnels
                }
            }));
            ws.on('message', async (message) => {
                try {
                    message = JSON.parse(message);
                    switch (message.event) {
                        case 'ping':
                            ws.send(JSON.stringify({
                                event: "pong",
                                data: message.data
                            }));
                            break;
                        case 'select':
                            ws.send(JSON.stringify({
                                event: "requests",
                                data: this.logs.filter(log => log.tunnel.id === message.data.id)
                            }));
                            break;
                        case 'save:user':
                            const { username, password } = message.data;
                            this.server.config.users[username] = password;
                            await this.server.config.save();
                            ws.send(JSON.stringify({
                                event: "saved:user",
                                data: this.server.config.getUserNames()
                            }));
                            break;
                        case 'delete:user':
                            delete this.server.config.users[message.data];
                            await this.server.config.save();
                            ws.send(JSON.stringify({
                                event: "saved:user",
                                data: this.server.config.getUserNames()
                            }));
                            break;
                        case 'flush':
                            this.clear(Object(message.data).id);
                            break;
                    }
                } catch (e) {
                    console.error(e)
                }
            })
        } catch (e) {
            console.error(e);
        }
    }

    public broadcast(event, data) {
        this.server.wss.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ event, data }));
            }
        });
    }

    protected doProxyReq(proxyReq, req) {
        const tunnel = this.server.getTunnelByHost(req.headers['host']);
        const info = {
            id: `${Math.random().toString(32).substr(2)}`,
            username: req.auth,
            createdAt: new Date().toISOString(),
            tunnel: tunnel.toJSON(),
            duration: null,
            req: {
                method: req.method,
                path: req.url,
                headers: req.headers,
                body: null
            },
            res: {
                statusCode: null,
                statusMessage: null,
                headers: null,
                body: null
            }
        };
        this.requests.set(req, info);
        const chunks = [];
        req.on('data', function (chunk) {
            chunks.push(chunk)
        });
        req.on('end', function () {
            info.req.body = Buffer.concat(chunks).toString('base64');
            console.info("Request Complete", info.id);
        });
    }

    protected doProxyRes(proxyRes, req, res) {
        let info = this.requests.get(req);
        info.res.statusCode = proxyRes.statusCode;
        info.res.statusMessage = proxyRes.statusMessage;
        info.res.headers = proxyRes.headers;
        const chunks = [];
        proxyRes.on('data', function (data) {
            chunks.push(data)
        });
        proxyRes.on('end', () => {
            info.res.body = Buffer.concat(chunks).toString('base64');
            info.duration = new Date().getTime() - new Date(info.createdAt).getTime();
            console.info("Response Complete", info.id);
            res.end();
            this.push(info);
        });
    }

    public push(info) {
        if (this.logs.length >= 1000) {
            this.logs.unshift();
        }
        this.logs.push(info);
        this.broadcast('request', info);
    }

    public clear(subdomain) {
        this.logs = this.logs.filter(log => log.tunnel.id !== subdomain);
        this.broadcast('clear', this.logs);
    }
}