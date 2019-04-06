import React            from 'react';
import {render}         from 'react-dom';
import 'antd/dist/antd.css';
import './index.css';
import App              from './App';
import {Provider}       from 'react-redux';
import {configureStore} from "./store";
import {Socket}         from "./store/middlewares/socket";

async function main() {
    const store = configureStore();
    Socket.init();
    render(
        <Provider store={store}>
            <App/>
        </Provider>
        , document.getElementById('root'));
}

main().catch(console.error);
