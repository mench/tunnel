import {connect as open} from "../actions/socket";
import {error}           from "../actions/socket";
import {trigger}         from "../actions/socket";
import {ActionType}      from "../actions/ActionType";
import {init}            from "../actions/app";

export class Socket {
    static ws: WebSocket;
    static connections = [];

    static connect(fn) {
        this.connections.push(fn);
    }

    static init(auth?) {
        if (!auth) {
            const a = localStorage.getItem('auth');
            auth = a ? JSON.parse(a) : null;
        }
        if (auth) {
            this.ws = new WebSocket(`wss://sites.li:10443?username=${auth.username}&password=${auth.password}`);
            this.connections.forEach((fn) => {
                fn(this.ws);
            });
        }

    }
}

export function createSocketMiddleware() {
    return ({ getState, dispatch }) => next => {

        Socket.connect((ws) => {
            setInterval(() => {
                ws.send(
                    JSON.stringify({
                        event: 'ping',
                        data: Date.now()
                    }),
                );
            }, 30000);
            ws.onopen = () => {
                dispatch(open());
            };
            ws.onmessage = ({ data }) => {
                try {
                    const payload = JSON.parse(data);
                    dispatch(trigger(payload));
                    switch (payload.event) {
                        case 'welcome':
                            dispatch({ type: ActionType.WELCOME, payload: payload.data });
                            break;
                        case 'create:tunnel':
                            dispatch({ type: ActionType.CREATE_TUNNEL, payload: payload.data });
                            break;
                        case 'remove:tunnel':
                            dispatch({ type: ActionType.REMOVE_TUNNEL, payload: payload.data });
                            break;
                        case 'requests':
                            dispatch({ type: ActionType.REQUESTS, payload: payload.data });
                            break;
                        case 'request':
                            dispatch({ type: ActionType.REQUEST, payload: payload.data });
                            break;
                        case 'unauthorized':
                            window.location.reload();
                            break;
                    }
                } catch (e) {
                    dispatch(error(e.message))
                }
            };
        });

        return action => {
            console.info(action)
            const ws = Socket.ws;
            if (!ws) {
                return next(action);
            }
            switch (action.type) {
                case ActionType.SOCKET_CONNECT:
                    dispatch(init());
                    break;
                case ActionType.SELECT:
                    ws.send(
                        JSON.stringify({
                            event: 'select',
                            data: {
                                id: action.payload
                            }
                        }),
                    );
                    break;
                default:
                    break;
            }

            return next(action);
        }
    }
}