import React, {PureComponent}      from 'react';
import {Form, Icon, Input, Button} from 'antd';
import * as socket                 from "../store/actions/socket";
import {connect}                   from "react-redux";
import {Modal}                     from "antd";
import {isConnecting}              from "../store/selectors/app";
import {State}                     from "../types/State";

class Login extends PureComponent<any> {

    handleSubmit = (e) => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                this.props.connect(values);
            }
        });
    };

    formRef:any;

    render() {
        const { getFieldDecorator } = this.props.form;
        return (
            <Modal
                className={"login-modal"}
                width={350}
                centered={true}
                confirmLoading={this.props.isConnecting}
                okText={"Login"}
                closable={false}
                cancelButtonProps={{
                    style:{display:'none'}
                }}
                title="Login"
                visible={true}
                onOk={this.handleSubmit}
            >
                <Form onSubmit={this.handleSubmit} ref={formRef=>this.formRef = formRef} className="login-form">
                    <Form.Item>
                        {getFieldDecorator('username', {
                            rules: [{ required: true, message: 'Please input your username!' }],
                        })(
                            <Input prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }}/>}
                                   placeholder="Username"/>
                        )}
                    </Form.Item>
                    <Form.Item>
                        {getFieldDecorator('password', {
                            rules: [{ required: true, message: 'Please input your Password!' }],
                        })(
                            <Input prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }}/>} type="password"
                                   placeholder="Password"/>
                        )}
                    </Form.Item>
                </Form>
            </Modal>

        );
    }
}

export default connect((state:State)=>({
    isConnecting:isConnecting(state)
}), {connect:socket.connect})(Form.create({ name: 'normal_login' })(Login));