import React, {PureComponent}                                                   from 'react';
import {Fragment}                                                               from 'react';
import {Layout, Menu, Icon, Row, Col, Statistic, Card, Dropdown, Button, Modal} from 'antd';
import {Avatar}                                                                 from 'antd';
import {Table}                                                                  from 'antd';
import {Badge}                                                                  from 'antd';
import {PageHeader}                                                             from 'antd';
import Requests                                                                 from "./components/Requests";
import {connect}                                                                from "react-redux";
import {State, Tunnel}                                                          from "./types/State";
import {Loader}                                                                 from "./components/Loader";
import {clearRequests, loadRequests, logout, select, toggleUsers}               from "./store/actions/app";
import {getSelectedTunnel}                                                      from "./store/selectors/app";
import Login                                                                    from "./components/Login";
import Users                                                                    from "./components/Users";
import {Encoder}                                                                from "./utils/Encoder";

const {
    Content, Sider,
} = Layout;


class App extends PureComponent<{
    loading: boolean,
    unauthorized: boolean,
    session: {
        id: string,
        domain: string
    },
    tunnels: Tunnel[],
    selected: Tunnel
    select: typeof select,
    logout: typeof logout,
    toggleUsers: typeof toggleUsers,
    clearRequests: typeof clearRequests,
    loadRequests: typeof loadRequests,
    loadedRequests: boolean
    loadingRequests: boolean
    openUsers: boolean
}> {

    onSelect = ({ key }) => {
        this.props.select(key);
    };

    closeConnection = (tunnelId) => {
        Modal.confirm({
            title: 'Do you Want to delete this connection?',
            content: tunnelId,
            async onOk() {
                const url = process.env.NODE_ENV === 'production' ? `https://${window.location.hostname}` : 'https://sites.li:10443';
                const { username, password } = JSON.parse(localStorage.getItem('tunnel-auth'));
                await fetch(`${url}/api/tunnels/${tunnelId}`, {
                    method: "DELETE",
                    headers: {
                        Authorization: `Basic ${Encoder.toBase64(`${username}:${password}`)}`
                    }
                })
            }
        });
    };

    render() {
        const {
            loading,
            session, tunnels,
            selected,
            loadedRequests,
            loadingRequests,
            logout,
            openUsers,
            toggleUsers,
            clearRequests,
            loadRequests
        } = this.props;

        const options = (
            <Menu>
                <Menu.Item key="1" onClick={() => toggleUsers(true)}>
                    <Icon type="usergroup-add"/>
                    <span className="nav-text">Users</span>
                </Menu.Item>
                <Menu.Item key="0" onClick={logout}>
                    <Icon type="logout"/>
                    <span className="nav-text">Logout</span>
                </Menu.Item>
            </Menu>
        );
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
                            <Dropdown overlay={options} trigger={['click']}>
                                <a style={{ float: 'right', fontSize: 18, color: '#555' }} className="ant-dropdown-link"
                                   href="javascript:;">
                                    <Icon type="setting"/>
                                </a>
                            </Dropdown>

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
                        <Content style={{ margin: '5px 16px 0' }}>
                            {!!selected &&
                            <React.Fragment>
                                <Card>
                                    <Row>
                                        <Col span={4}>
                                            <Statistic title="User" value={selected.username}/>
                                        </Col>
                                        <Col span={4}>
                                            <Statistic title="Http" valueRender={() => <a
                                                href={`http://${selected.id}.${session.domain}`}
                                                target="_blank">{`http://${selected.id}.${session.domain}`}</a>}/>
                                        </Col>
                                        <Col span={4}>
                                            <Statistic title="Https" valueRender={() => <a
                                                href={`https://${selected.id}.${session.domain}`}
                                                target="_blank">{`https://${selected.id}.${session.domain}`}</a>}/>
                                        </Col>
                                        <Col span={4}>
                                            <Statistic title="Internet Port" value={selected.internetPort}/>
                                        </Col>
                                        <Col span={4}>
                                            <Statistic title="Relay Port" value={selected.relayPort}/>
                                        </Col>
                                        <Col span={4}>
                                            <Button type="danger"
                                                    onClick={() => this.closeConnection(selected.id)}><Icon
                                                type="close-circle"/> Close Connection</Button>
                                        </Col>
                                    </Row>
                                </Card>

                            </React.Fragment>
                            }
                            {(loadingRequests || loadedRequests) &&
                            <React.Fragment>
                                <div>&nbsp;</div>
                                <div style={{ paddingLeft: 24, paddingRight: 24, background: '#fff', height: 'auto' }}>
                                    <Requests onClear={() => clearRequests(selected.id)}
                                              onLoadMore={() => loadRequests(selected.id)}/>
                                </div>
                            </React.Fragment>
                            }
                        </Content>
                    </Layout>
                </Fragment>
                }
                {!session && !loading &&
                <Layout>
                    <Content style={{ margin: '24px 16px 0' }}>
                        <Login/>
                    </Content>
                </Layout>
                }
                {loading && <Loader/>}
                {openUsers && <Users/>}
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
    openUsers: state.app.openUsers,
}), { select, logout, toggleUsers, clearRequests, loadRequests })(App);
