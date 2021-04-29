import { RelayServer }             from "./Net";
import { logger, LoggerInterface } from "@relcu/tunnel-common";

export class Tunnel<R extends RelayServer = RelayServer> {

  @logger()
  readonly logger: LoggerInterface;
  readonly secure: boolean;
  readonly host: string;
  public createdAt: Date;
  constructor(
    public id: string,
    public internetPort: number,
    public relay: R,
    public username,
    secure: string,
    host: string
  ) {
    this.internetPort = internetPort;
    this.relay = relay;
    this.createdAt = new Date();
    this.logger.debug(`created`, { id, internetPort, relay });
    this.host = host || "0.0.0.0";
    this.secure = secure === "true" || false;
  }
  getWebOptions(config) {
    return {
      changeOrigin: true,
      ssl: { key: config.ssl.key, cert: config.ssl.cert },
      secure: this.secure, target: `${this.secure ? "https" : "http"}://${this.host}:${this.internetPort}`
    };
  }
  getWsOptions(config) {
    return {
      changeOrigin: true,
      ssl: { key: config.ssl.key, cert: config.ssl.cert },
      secure: this.secure, target: `${this.secure ? "wss" : "ws"}://${this.host}:${this.internetPort}`
    };
  }

  toJSON() {
    return {
      id: this.id,
      username: this.username,
      internetPort: this.internetPort,
      relayPort: this.relay.relayPort,
      createdAt: this.createdAt
    };
  }
}
