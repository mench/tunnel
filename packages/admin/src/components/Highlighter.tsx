import React, {PureComponent} from 'react';
import {lazy}                 from 'react';
import {Suspense}             from 'react';
import {Spin}                 from 'antd';

const SyntaxHighlighter = lazy(() => import('react-syntax-highlighter'));
const ReactJson = lazy(() => import('react-json-view'));

export class Highlighter extends PureComponent<{
    body: any
    contentType?: string
}> {
    render() {
        const { body, contentType } = this.props;
        try {
            if (String(contentType).includes('application/json')) {
                const source = typeof body === 'object' ? body : JSON.parse(body);
                return (
                    <div style={{ background: '#fff' }}>
                        <Suspense fallback={<Spin tip="Loading..."/>}>
                            <ReactJson collapsed={4} name={false} enableClipboard={true}
                                       src={source}/>
                        </Suspense>

                    </div>
                )
            }
        } catch (e) {
            console.error(e)
        }
        return (
            <div className="tunnel-code-syntax">
                {body &&
                <Suspense fallback={<Spin tip="Loading..."/>}>
                    <SyntaxHighlighter showLineNumbers={true}>
                        {String(body)}
                    </SyntaxHighlighter>
                </Suspense>
                }

            </div>
        )
    }
}