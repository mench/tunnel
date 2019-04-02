import {logger, LoggerInterface}     from "@tunnel/common";
import {Tunnel}                      from "./Tunnel";
import * as getAvailablePort              from "get-port";
import {portValidator}               from "port-validator";
import {RelayServer, TLSRelayServer} from "./Net";
import {Config}                      from "./Config";


export class TunnelManager {

    @logger()
    readonly logger: LoggerInterface;

    public tunnels: Map<string, Tunnel>;

    constructor(protected config: Config) {
        this.tunnels = new Map<string, Tunnel>();
        this.logger.debug(`created`, config);
    }

    async newTunnel(id) {
        this.logger.debug(`newTunnel - start`, id);
        const internetPort = await getAvailablePort();
        const relayPort = await getAvailablePort();
        const relayOptions = {};
        const ssl = {
            key: this.config.ssl.key,
            cert: this.config.ssl.cert
        };
        let relay = null;
        if (this.config.ssl.enabled) {
            relay = new TLSRelayServer({ relayPort, internetPort }, {
                internetListener: { tlsOptions: ssl }
            })
        } else {
            relay = new RelayServer({ relayPort, internetPort }, relayOptions)
        }
        const tunnel = new Tunnel(id, internetPort, relay);
        this.tunnels.set(tunnel.id, tunnel);
        this.logger.debug('newTunnel - end', tunnel, internetPort, relay, this.tunnels.size);
        return tunnel
    }

    getTunnel(id){
        return this.tunnels.get(id);
    }

    remove(id, secret) {
        this.logger.debug('remove - start', { id, secret });
        const tunnel = this.tunnels.get(id);
        this.logger.debug('remove - tunnel', { tunnel });
        if (!tunnel) {
            return false
        }
        tunnel.relay.end();
        this.tunnels.delete(id);
        this.logger.debug('remove - end', { id, secret });
        return true
    }

    removeAll() {
        this.logger.debug(`removeAll - start`, this.tunnels.size)
        for (const [internetPort, tunnel] of this.tunnels.entries()) {
            tunnel.relay.end();
            this.tunnels.delete(internetPort)
        }
        this.logger.debug(`removeAll - end`, this.tunnels.size)
    }
}
