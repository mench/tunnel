import {logger, LoggerInterface} from "@relcu/tunnel-common";
import {URL}                     from 'url';
import {RequestOptions}          from 'http';
import * as Http                 from 'http';
import * as Https                from 'https';
import {RelayClient}             from "./Net/RelayClient";


export class Client {

    @logger()
    readonly logger: LoggerInterface;

    public domain: string;
    public subdomain: string;
    public host: string;
    public auth: string;
    public port: number;
    public ssl: boolean;
    public url: string;
    public deleted = false;
    public relay = null;
    public internetPort = null;
    public relayPort = null;
    public https = null;
    public http = null;
    public endpoint: URL = null;
    public createdAt = null;

    constructor({ port, auth, domain = 'mamble.io', subdomain, ssl = false, host = '0.0.0.0' }) {
        this.port = port;
        this.host = host;
        this.domain = domain;
        this.subdomain = subdomain;
        this.ssl = ssl;
        this.auth = auth;
        this.url = `http${this.ssl ? 's' : ''}://${auth}@${domain}`;
        this.https = `https://${subdomain}.${domain}`;
        this.http = `http://${subdomain}.${domain}`;
        this.endpoint = new URL(`${this.url}/api/tunnels/${this.subdomain}?secure=${this.ssl}&host=${this.host}`);
        this.logger.debug(`created`, this)
    }

    async request(method: string, url: URL) {
        return new Promise<{ status: number, headers: any, body: string }>((accept, reject) => {
            const options: RequestOptions = {
                method: method,
                hostname: url.hostname,
                port: url.port,
                auth:`${url.username}:${url.password}`,
                path: `${url.pathname}${url.search}`
            };
            const http = this.ssl ? Https : Http;
            const req = http.request(options, (res) => {
                const chunks: Buffer[] = [];
                res.on('data', (chunk) => {
                    chunks.push(chunk);
                });
                res.on('end', (data) => {
                    if (data) {
                        chunks.push(data)
                    }
                    try {
                        const body: string = Buffer.concat(chunks).toString('utf8');
                        accept({
                            status: res.statusCode,
                            headers: res.headers,
                            body
                        })
                    } catch (e) {
                        reject(e)
                    }
                });
                res.on('error', reject);
            });
            req.on('error', reject);
            req.end();
        });
    }

    async create() {
        const response = await this.request('GET', this.endpoint);
        if( response.status >=400 ){
            throw new Error(response.body);
        }
        const body = JSON.parse(response.body);
        this.logger.debug('create', body);
        if (body.error) {
            throw new Error(body && body.error ? body.error : 'Unexpected response')
        }
        this.createdAt = body.createdAt;
        this.internetPort = body.internetPort;
        this.relayPort = body.relayPort;
        const url = new URL(this.url);
        this.relay = new RelayClient({
            host: this.host,
            port: this.port,
            relayHost: url.hostname,
            relayPort: this.relayPort
        }, { tls: false });
        return this

    }

    async delete() {
        if (this.deleted) {
            return true
        }
        const response = await this.request('DELETE', this.endpoint);
        const body = JSON.parse(response.body);
        this.logger.debug('delete', body)
        if (body.error) {
            throw new Error(body && body.error ? body.error : 'Unexpected response')
        }
        this.deleted = true;
        return true
    }

    async close() {
        this.relay.end();
        await this.delete();
        return true
    }
}
