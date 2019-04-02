import {env, toBool} from "@tunnel/common";

export class Config {
    public domain: string;
    public users: { [ s: string ]: string };
    public port: number =  parseInt(env('SSL_PORT',8080));
    public address: string = '0.0.0.0';
    public ssl:{
        port:number;
        enabled:boolean;
        cert?: Buffer;
        key?: Buffer;
    } = {
        port :  parseInt(env('SSL_PORT',443)),
        enabled:toBool(env('SSL_ENABLED',false))
    }
}