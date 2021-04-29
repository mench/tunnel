import { logger, LoggerInterface } from "@relcu/tunnel-common";
import { Tunnel }                  from "./Tunnel";
import * as getAvailablePort       from "get-port";
import { makeRange }               from "get-port";
import { RelayServer }             from "./Net";

export class TunnelManager {

  @logger()
  readonly logger: LoggerInterface;

  public tunnels: Map<string, Tunnel>;

  constructor() {
    this.tunnels = new Map<string, Tunnel>();
    this.logger.debug(`created`);
  }

  async newTunnel(id, username, options) {
    this.logger.debug(`newTunnel - start`, id);
    const internetPort = await getAvailablePort({ port: makeRange(30000, 35000) });
    const relayPort = await getAvailablePort({ port: makeRange(35001, 40000) });
    const relayOptions = {};
    const relay = new RelayServer({ relayPort, internetPort }, relayOptions);
    const tunnel = new Tunnel(id, internetPort, relay, username, options.secure, options.host);
    this.tunnels.set(tunnel.id, tunnel);
    this.logger.debug("newTunnel - end", tunnel, internetPort, relay, this.tunnels.size);
    return tunnel;
  }

  getTunnel(id) {
    return this.tunnels.get(id);
  }

  remove(id) {
    this.logger.debug("remove - start", { id });
    const tunnel = this.tunnels.get(id);
    this.logger.debug("remove - tunnel", { tunnel });
    if (!tunnel) {
      return false;
    }
    tunnel.relay.end();
    this.tunnels.delete(id);
    this.logger.debug("remove - end", { id });
    return true;
  }

  removeAll() {
    this.logger.debug(`removeAll - start`, this.tunnels.size);
    for (const [internetPort, tunnel] of this.tunnels.entries()) {
      tunnel.relay.end();
      this.tunnels.delete(internetPort);
    }
    this.logger.debug(`removeAll - end`, this.tunnels.size);
  }

  toJSON() {
    const tunnels = [];
    this.tunnels.forEach(tunnel => {
      tunnels.push(tunnel.toJSON());
    });
    return tunnels;
  }
}
