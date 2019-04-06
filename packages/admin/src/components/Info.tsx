import React, {FC, PureComponent} from 'react';
import {Table}                    from 'antd';
import {Payload}                  from "./Payload";
import {ReqInfo}                  from "../types/State";


export const Info:FC<ReqInfo> = (props)=>(
    <Table
        showHeader={false}
        pagination={false}
        className="payload-table"
        columns={[
            {
                dataIndex: 'payload',
                render: () => <Payload {...props} />
            }
        ]}
        dataSource={[
            {
                key: '1',
                payload: ''
            }
        ]}
    />
);