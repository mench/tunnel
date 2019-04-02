import {Server} from "./Server";
import {Config} from "./Config";

const config = new Config();
config.domain = 'sites.li:8080';

new Server(config).run();