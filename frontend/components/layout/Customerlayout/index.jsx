import React, { useState } from 'react';
import {
    AccountBookOutlined,
    BranchesOutlined,
    DashboardOutlined,
    DashOutlined,
    DollarCircleOutlined,
    GifOutlined,
    GiftOutlined,
    LogoutOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    SyncOutlined,
    UploadOutlined,
    UserOutlined,
    VideoCameraOutlined,
} from '@ant-design/icons';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button, Layout, Menu, theme } from 'antd';
const { Header, Sider, Content } = Layout;
import Cookies from "universal-cookie";
const cookies = new Cookies()
const CustomerLayout = ({ children }) => {
    const { pathname } = useLocation();
    const navigate = useNavigate();
     const logoutFunc = ()=>{
        sessionStorage.removeItem("userInfo");
        cookies.remove("authToken");
        navigate("/");
    }

    const items = [
        {
            key: '/customer',
            icon: <DashboardOutlined />,
            label: <Link to='/customer'>Dashboard</Link>,
        },
        {
            key: '/customer/transaction',
            icon: <BranchesOutlined />,
            label: <Link to='/customer/transaction'> Transactions</Link>,
        },
        {
            key: '/customer/exchange',
            icon: <SyncOutlined />,
            label: <Link to='/customer/exchange'> exchange</Link>,
        },
         {
            key: '/customer/logout',
            icon: <LogoutOutlined />,
            label: <Button
            type='text'
            className='!text-gray-300 !font-semibold'
            onClick={logoutFunc}
            >
            Logout
            </Button>
        }

    ];




    const [collapsed, setCollapsed] = useState(false);
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();
    return (
        <Layout className='!min-h-screen'>
            <Sider trigger={null} collapsible collapsed={collapsed}>
                <div className="demo-logo-vertical" />
                <Menu
                    theme="dark"
                    mode="inline"
                    defaultSelectedKeys={[pathname]}
                    items={items}
                />
            </Sider>
            <Layout>
                <Header style={{ padding: 0, background: colorBgContainer }}>
                    <Button
                        type="text"
                        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                        onClick={() => setCollapsed(!collapsed)}
                        style={{
                            fontSize: '16px',
                            width: 64,
                            height: 64,
                        }}
                    />
                </Header>
                <Content
                    style={{
                        margin: '24px 16px',
                        padding: 24,
                        minHeight: 280,
                        background: colorBgContainer,
                        borderRadius: borderRadiusLG,
                    }}
                >
                    {children}
                </Content>
            </Layout>
        </Layout>
    );
};
export default CustomerLayout;