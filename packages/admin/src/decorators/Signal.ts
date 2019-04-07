export type Signal<T extends Function> = T & {
    handlers:Set<T>;
    attach(callback: T): T;
    detach(callback: T): T;
    detachAll();
}
export function signal(target: any, propertyKey: string): any {
    return {
        get() {
            let handlers = new Set<Function>();
            function signal(...args) {
                for (let handler of handlers) {
                    if( handler ){
                        handler(...args);
                    }
                }
            }
            Object.defineProperties(signal, {
                handlers:{
                    get(){
                        return handlers;
                    }
                },
                attach: {
                    value(handler: Function) {
                        handlers.add(handler);
                        return handler;
                    }
                },
                detach: {
                    value(handler: Function) {
                        handlers.delete(handler);
                        return handler;
                    }
                },
                detachAll: {
                    value() {
                        handlers.clear();
                    }
                }
            });
            Object.defineProperty(this, propertyKey, {
                value: signal
            });
            return signal;
        }
    };
}