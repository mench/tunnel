import React, {PureComponent}      from 'react';
import {Fragment}                  from 'react';
import {Layout, Menu, Icon, Modal} from 'antd';
import {Avatar}                    from 'antd';
import {Table}                     from 'antd';
import {Badge}                     from 'antd';
import {PageHeader}                from 'antd';
import Requests                    from "./components/Requests";
import {connect}                   from "react-redux";
import {State, Tunnel}             from "./types/State";
import {Loader}                    from "./components/Loader";
import {select}                    from "./store/actions/app";
import {getSelectedTunnel}         from "./store/selectors/app";
import Login                       from "./components/Login";

const {
    Content, Sider,
} = Layout;


class App extends PureComponent<{
    loading: boolean,
    unauthorized: boolean,
    session: {
        id: string,
        domain: string,
        connections: number
    },
    tunnels: Tunnel[],
    selected: Tunnel
    select: typeof select,
    loadedRequests: boolean
    loadingRequests: boolean
}> {

    onSelect = ({ key }) => {
        this.props.select(key);
    };

    render() {
        const { loading, session, tunnels, selected, loadedRequests, loadingRequests } = this.props;
        return (
            <Layout style={{ height: "100%" }}>
                {!loading && !!session &&
                <Fragment>
                    <Sider
                        theme="light"
                        breakpoint="lg"
                        collapsedWidth="0"
                    >
                        <div className="logo">
                            <Avatar style={{ backgroundColor: "'#f56a00", verticalAlign: 'middle' }} size="default">
                                {session.id.charAt(0).toUpperCase()}
                            </Avatar>
                            <span
                                style={{ marginLeft: 10 }}>{session.id.charAt(0).toUpperCase() + session.id.slice(1).toLowerCase()}</span>
                        </div>
                        <Table showHeader={false}
                               pagination={false}
                               columns={[{ dataIndex: 'name' }, { dataIndex: 'value' }]}
                               dataSource={[{
                                   key: '1',
                                   name: 'ID',
                                   value: session.id
                               }, {
                                   key: '2',
                                   name: 'DOMAIN',
                                   value: session.domain
                               }, {
                                   key: '3',
                                   name: 'CONNECTIONS',
                                   value: session.connections
                               }]} size="middle"/>
                        <Menu theme="light" mode="inline" onSelect={this.onSelect}>
                            {
                                tunnels.map(tunnel => (
                                    <Menu.Item key={tunnel.id}>
                                        <Icon type="wifi"/>
                                        <span className="nav-text">{tunnel.id}</span>
                                        <Badge status={'success'} style={{ float: 'right' }}/>
                                    </Menu.Item>
                                ))
                            }
                        </Menu>
                    </Sider>
                    <Layout>
                        <Content style={{ margin: '24px 16px 0' }}>
                            {!!selected &&
                            <PageHeader
                                title="Requests"
                                subTitle={<React.Fragment>
                                    Domains [ <a href={`https://${selected.id}.${session.domain}`}
                                                 target="_blank">{`https://${selected.id}.${session.domain}`}</a>
                                    &nbsp; &nbsp;
                                    <a href={`http://${selected.id}.${session.domain}`}
                                       target="_blank">{`http://${selected.id}.${session.domain}`}</a> ]
                                </React.Fragment>}
                            />
                            }
                            {(loadingRequests || loadedRequests )&&
                            <React.Fragment>
                                <div>&nbsp;</div>
                                <div style={{ padding: 24, background: '#fff', height: 'auto' }}>
                                    <Requests/>
                                </div>
                            </React.Fragment>
                            }
                        </Content>
                    </Layout>
                </Fragment>
                }
                {!session &&
                <Layout>
                    <Content style={{ margin: '24px 16px 0' }}>
                        <Modal
                            className={"login-modal"}
                            width={350}
                            footer={null}
                            centered={true}
                            title="Login"
                            visible={true}
                        >
                            <Login />
                        </Modal>
                    </Content>
                </Layout>
                }
                {loading && <Loader/>}

            </Layout>
        );
    }
}

export default connect((state: State) => ({
    selected: getSelectedTunnel(state),
    loading: state.app.status === 'loading',
    unauthorized: state.app.status === 'unauthorized',
    session: state.app.session,
    tunnels: state.app.tunnels,
    loadedRequests: state.app.loadedRequests,
    loadingRequests: state.app.loadingRequests,
}), { select })(App);
