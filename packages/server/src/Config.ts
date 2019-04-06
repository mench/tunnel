export class Config {
    public domain: string;
    public users: { [ s: string ]: string };
    public port: number =  8080;
    public address: string = '0.0.0.0';
    public ssl:{
        port:number;
        enabled:boolean;
        cert?: Buffer;
        key?: Buffer;
    } = {
        port :  443,
        enabled:false
    }
}