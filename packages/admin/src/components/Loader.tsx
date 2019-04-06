import React, {PureComponent} from 'react';
import {Icon}                 from 'antd';
import {Spin}                 from 'antd';

export const Loader = () => {
    const antIcon = <Icon type="loading" style={{ fontSize: 32 }} spin/>;
    return (
        <Spin style={{position:'absolute',left:'50%',top:'50%',zIndex:10000}} indicator={antIcon}/>
    )
};