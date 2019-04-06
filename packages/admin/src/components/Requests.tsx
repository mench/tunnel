import React, {PureComponent} from 'react';
import {Table}                from 'antd';
import {Tag}                  from 'antd';
import {Info}                 from "./Info";
import {connect}              from "react-redux";
import {ReqInfo, State}       from "../types/State";
import {getSelectedRequests}  from "../store/selectors/app";
import {Time}                 from "../utils/Time";

class Requests extends PureComponent<{
    loading: boolean,
    loaded: boolean,
    requests: ReqInfo[]
}> {
    render() {
        const { loading, loaded, requests } = this.props;
        return (
            <Table
                className="context-table"
                showHeader={true}
                pagination={false}
                loading={loading}
                expandedRowRender={(record:any)=><Info {...requests.find(i=>i.id===record.key)} />}
                columns={[
                    {
                        title: "Method",
                        dataIndex: 'method',
                        render: (value) => {
                            const colors = {
                                'GET': 'geekblue',
                                'POST': 'orange',
                                'DELETE': 'red',
                                'PUT': 'orange',
                            };
                            const method = String(value).toUpperCase();
                            const color = colors[method] || 'geekblue';
                            return <Tag color={color}>{method}</Tag>
                        }
                    },
                    { title: "Path", dataIndex: 'path' },
                    {
                        title: "Status",
                        dataIndex: 'status',
                        render: (value) => {
                            let color = "geekblue";
                            if (value >= 200 && value < 300) {
                                color = "green"
                            } else if (value >= 300 && value < 400) {
                                color = "orange"
                            }else if( value>=400 ){
                                color = "red"
                            }
                            return <Tag
                                color={color}>{value}</Tag>
                        }
                    },
                    { title: "Duration", dataIndex: 'duration' },
                    { title: "Happened", dataIndex: 'happened' },
                ]}
                dataSource={(loaded ? requests : []).map(info => (
                    {
                        key: info.id,
                        method: info.req.method,
                        path: info.req.path,
                        status: info.res.statusCode,
                        duration: `${info.duration}ms`,
                        happened: Time.difference(new Date().getTime(), new Date(info.createdAt).getTime()),
                    }
                ))} size="middle"/>
        )
    }
}

export default connect((state: State) => ({
    loading: state.app.loadingRequests,
    loaded: state.app.loadedRequests,
    requests: getSelectedRequests(state)
}))(Requests)