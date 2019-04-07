import React, {PureComponent}                           from 'react';
import {Button, Form, Icon, Input}                      from 'antd';
import {connect}                                        from "react-redux";
import {Modal}                                          from "antd";
import {deleteUser, saveUser, toggleUsers, updateUsers} from "../store/actions/app";
import {State}                                          from "../types/State";

const createUserForm = (id) => {
    const hasErrors = (fieldsError) => {
        return Object.keys(fieldsError).some(field => fieldsError[field]);
    };
    const UserForm = (props) => {
        const { getFieldDecorator, getFieldsError } = props.form;
        const handleSubmit = (e) => {
            e.preventDefault();
            props.form.validateFields((err, values) => {
                if (!err) {
                    props.save(values);
                }
            });
        };
        return (
            <Form layout="inline" onSubmit={handleSubmit} className="user-form">
                <Form.Item>
                    {getFieldDecorator('username', {
                        rules: [{ required: true, message: 'Please input your username!' }],
                        initialValue: props.username
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
                <Form.Item>
                    <Button
                        type="default"
                        htmlType="submit"
                        disabled={hasErrors(getFieldsError())}
                    >
                        Save
                    </Button>
                </Form.Item>
                <Form.Item>
                    <Button
                        onClick={() => {
                            Modal.confirm({
                                title: 'Do you Want to delete these user?',
                                content: props.username,
                                onOk() {
                                    props.delete(props.username)
                                }
                            });
                        }}
                        type="danger"
                    >
                        <Icon type="delete"/>
                    </Button>
                </Form.Item>
            </Form>
        )
    };
    return Form.create({ name: `user-${id}` })(UserForm)
};

class Users extends PureComponent<any> {

    render() {
        return (
            <Modal
                className={"users"}
                width={610}
                centered={true}
                footer={null}
                closable={true}
                visible={true}
                onCancel={() => this.props.toggleUsers(false)}
                title="Users"
            >
                {this.props.users.map((username, i) => {
                    const UserForm = createUserForm(i);
                    return <UserForm save={this.props.saveUser} delete={this.props.deleteUser} username={username} key={i}/>
                })}
                <div style={{ textAlign: 'right', marginRight: 28, marginTop: 5 }}>
                    <Button
                        onClick={() => this.props.updateUsers([
                            ...this.props.users,
                            null
                        ])}
                        type="primary"
                        htmlType="submit"
                    >
                        Add
                    </Button>
                </div>
            </Modal>

        );
    }
}

export default connect((state: State) => ({
    users: state.app.users
}), { saveUser, updateUsers, toggleUsers, deleteUser })(Users);