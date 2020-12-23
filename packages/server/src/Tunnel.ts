import {RelayServer}             from "./Net";
import {logger, LoggerInterface} from "@relcu/tunnel-common";

export class Tunnel<R extends RelayServer = RelayServer> {

    @logger()
    readonly logger: LoggerInterface;

    public createdAt: Date;

    constructor(
        public id:string,
        public internetPort:number,
        public relay: R,
        public username
    ) {
        this.internetPort = internetPort;
        this.relay = relay;
        this.createdAt = new Date();
        this.logger.debug(`created`, { id, internetPort, relay });
    }

    toJSON(){
        return {
            id:this.id,
            username:this.username,
            internetPort:this.internetPort,
            relayPort:this.relay.relayPort,
            createdAt:this.createdAt
        }
    }
}
