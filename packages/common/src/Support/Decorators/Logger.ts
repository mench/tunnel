import * as Debug from 'debug';

export interface LoggerInterface {
    debug(message: string, ...args: any[]): void;
    info(message: string, ...args: any[]): void;
    warn(message: string, ...args: any[]): void;
    error(message: string, ...args: any[]): void;
}

export class Logger implements LoggerInterface{

    protected debugger;

    constructor(scope?){
        this.debugger = Debug(`tunnel:${scope||""}`);
    }

    public debug(message: string, ...args: any[]): void {
        this.log('debug', message, ...args);
    }

    public info(message: string, ...args: any[]): void {
        this.log('info', message, ...args);
    }

    public warn(message: string, ...args: any[]): void {
        this.log('warn', message, ...args);
    }

    public error(message: string, ...args: any[]): void {
        this.log('error', message, ...args);
    }

    private log(level: string, message: string, ...args: any[]): void {
        this.debugger(`[${level}] ${message}`, ...args);
    }

}

export function logger(name?: string) {
    return (target, key) => {
        return Object.defineProperty(target,key,{
            get(){
                return new Logger(name||target.constructor.name)
            }
        })
    }
}