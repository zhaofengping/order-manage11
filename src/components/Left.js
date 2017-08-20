import React,{Component} from 'react';
import {
  BrowserRouter as Router,
  Route,
  Link
} from 'react-router-dom'
import { Menu, Icon } from 'antd';
import style from '../styles/ordermanage.css';
const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;

class Left extends React.Component {
  render() {
    return (
      <div className={style.left}>
        <Menu
          defaultSelectedKeys={['3']}
          style={{minHeight:580}}
          mode="inline"
        >
          <Menu.Item key="1">
            <Icon type="pie-chart" />
            <span><Link to="/">首页</Link></span>
          </Menu.Item>
          <Menu.Item key="2">
            <Icon type="pie-chart" />
            <span><Link to="/">组织架构</Link></span>
          </Menu.Item>
          <Menu.Item key="3">
            <Icon type="pie-chart" />
            <span><Link to="/">订单头表</Link></span>
          </Menu.Item>
          <Menu.Item key="4">
            <Icon type="pie-chart" />
            <span><Link to="/">附件管理</Link></span>
          </Menu.Item>
          <Menu.Item key="5">
            <Icon type="pie-chart" />
            <span><Link to="/">计划任务</Link></span>
          </Menu.Item>
          <Menu.Item key="6">
            <Icon type="pie-chart" />
            <span><Link to="/">工作流</Link></span>
          </Menu.Item>
        </Menu>
      </div>
    );
  }
}

export default Left
