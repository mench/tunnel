import {connecting, open} from "../actions/socket";
import {close}            from "../actions/socket";
import {error}            from "../actions/socket";
import {trigger}          from "../actions/socket";
import {ActionType}       from "../actions/ActionType";
import {init}             from "../actions/app";
import {Socket}           from "../services/Socket";
import {message, Modal}   from "antd";


export function createSocketMiddleware() {
    return ({ getState, dispatch }) => next => {
        const url = process.env.NODE_ENV === 'production' ? `wss://${window.location.hostname}` : 'wss://sites.li:10443';
        const ws = new Socket(url);

        ws.onConnecting.attach(() => dispatch(connecting()));
        ws.onOpen.attach(() => dispatch(open()));
        ws.onClose.attach(() => dispatch(close()));
        ws.onMessage.attach((payload) => {
            try {
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
                    case 'loaded:requests':
                        dispatch({ type: ActionType.LOADED_REQUESTS, payload: payload.data });
                        break;
                    case 'clear':
                        dispatch({ type: ActionType.CLEAR, payload: payload.data });
                        break;
                    case 'saved:user':
                        message.success('users are successfully updated');
                        dispatch({ type: ActionType.UPDATE_USER, payload: payload.data })
                        break;
                }
            } catch (e) {
                dispatch(error(e.message))
            }
        });

        return action => {
            if (action.type === ActionType.SOCKET_CLOSE) {
                if (getState().app.status === 'loaded') {
                    Modal.warning({
                        okText: "Reload",
                        onOk: () => window.location.reload(),
                        title: 'Socket connection lost',
                        content: 'please reload the page',
                    });
                }
                return next(action);
            }
            if (!ws.connected && action.type != ActionType.SOCKET_CONNECT) {
                return next(action);
            }
            switch (action.type) {
                case ActionType.SOCKET_CONNECT:
                    ws.connect(action.payload);
                    break;
                case ActionType.LOGOUT:
                    ws.disconnect();
                    break;
                case ActionType.SOCKET_OPEN:
                    dispatch(init());
                    break;
                case ActionType.SAVE_USER:
                    ws.send({
                        event: 'save:user',
                        data: action.payload
                    });
                    break;
                case ActionType.DELETE_USER:
                    ws.send({
                        event: 'delete:user',
                        data: action.payload
                    });
                    break;
                case ActionType.FLUSH:
                    ws.send({
                        event: 'flush',
                        data: {
                            id:action.payload
                        }
                    });
                    break;
                case ActionType.SELECT:
                    ws.send({
                        event: 'select',
                        data: {
                            id: action.payload
                        }
                    });
                    break;
                case ActionType.LOAD_REQUESTS:
                    ws.send({
                        event: 'load:requests',
                        data: {
                            id: action.payload,
                            page:getState().requests.page + 1
                        }
                    });
                    break;
                default:
                    break;
            }

            return next(action);
        }
    }
}