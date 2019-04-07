import React, {FC}   from 'react';
import {Tabs}        from 'antd';
import {Highlighter} from "./Highlighter";
import {ReqInfo}     from "../types/State";
import {Decoder}     from "../utils/Decoder";

const TabPane = Tabs.TabPane;

export const Payload: FC<ReqInfo> = (props) => {
    const reqBody = Decoder.fromBase64(props.req.body);
    const resBody = Decoder.fromBase64(props.res.body);
    return (
        <Tabs type="card">
            <TabPane tab="Request" key="1">
                <Tabs>
                    <TabPane tab="Body" key="1.1">
                        <div className="tunnel-code-syntax">
                            <Highlighter body={reqBody} contentType={props.req.headers['content-type']} />
                        </div>
                    </TabPane>
                    <TabPane tab="Headers" key="1.2">
                        <Highlighter body={props.req.headers} contentType="application/json" />
                    </TabPane>
                    <TabPane tab="Raw" key="1.3">
                        <Highlighter body={`${Object.keys(props.req.headers).map((key)=>
                            `${key}: ${props.req.headers[key]}`
                        ).join('\n') }\n
${reqBody}`} />
                    </TabPane>
                </Tabs>
            </TabPane>
            <TabPane tab="Response" key="2">
                <Tabs>
                    <TabPane tab="Body" key="2.1">
                        <Highlighter body={resBody} contentType={props.res.headers['content-type']} />
                    </TabPane>
                    <TabPane tab="Headers" key="2.2">
                        <Highlighter body={props.res.headers} contentType="application/json" />
                    </TabPane>
                    <TabPane tab="Raw" key="2.3">
                        <Highlighter body={`${Object.keys(props.res.headers).map((key)=>
                            `${key}: ${props.res.headers[key]}`
                        ).join('\n') }\n
${resBody}`} />
                    </TabPane>
                </Tabs>
            </TabPane>
        </Tabs>
    )
};