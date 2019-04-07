import {signal, Signal} from "../../decorators/Signal";

export class Socket {

    @signal
    public onMessage: Signal<(payload: any) => any>;

    @signal
    public onOpen: Signal<() => any>;

    @signal
    public onClose: Signal<() => any>;

    @signal
    public onDisconnect: Signal<() => any>;

    @signal
    public onConnecting: Signal<() => any>;

    private ws: WebSocket;

    private interval:any;

    constructor(public url: string) {
        const auth = localStorage.getItem('tunnel-auth');
        if( auth ){
           this.connect(JSON.parse(auth));
        }
    }

    get connected() {
        return this.ws && this.ws.readyState == 1;
    }

    public connect({ username, password }) {
        this.onConnecting();
        const ws = this.ws = new WebSocket(`${this.url}?username=${username}&password=${password}`);
        ws.onmessage = ({ data }) => this.onMessage(JSON.parse(data));
        const onOpen = ws.onopen = () => this.onOpen();
        ws.onclose = () => {
            this.onClose();
            this.onDisconnect();
            this.onOpen.detach(onOpen);
            clearInterval(this.interval);
        };
        this.onOpen.attach(()=>{
            localStorage.setItem('tunnel-auth', JSON.stringify({ username, password }));
            this.interval = setInterval(() => {
                this.send({
                    event: 'ping',
                    data: Date.now()
                });
            }, 30000);
        });

    }

    send({ event, data }) {
        if (this.connected) {
            this.ws.send(
                JSON.stringify({
                    event,
                    data
                }),
            );
        }
    }

    disconnect(){
        if (this.connected) {
            localStorage.removeItem('tunnel-auth');
            this.ws.close()
        }
    }

}