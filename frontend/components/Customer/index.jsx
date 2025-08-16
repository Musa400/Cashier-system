import CustomerLayout from "../layout/Customerlayout"

import useSWR from "swr"
import {fetchData} from "../../modules/modules"
import { Card, Row, Col, Statistic, Typography, Space, Table, Tag } from 'antd';
import { LoadingOutlined, ArrowUpOutlined, ArrowDownOutlined, TransactionOutlined } from '@ant-design/icons';
import { useEffect } from 'react';

const { Title, Text } = Typography;

const CustomerDashboard = ()=>{
    // Get UserInfo from sessionStorage
    const userInfo = JSON.parse(sessionStorage.getItem("userInfo"));
    
    // Fetch transaction summary data
    const {data: trData} = useSWR(
        `/api/transaction/summary?accountNo=${userInfo.accountNo}`,
        fetchData,
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
            refreshInterval: 1200000,
        }
    );
    console.log(trData)

    // Fetch currency data
    const {data: currencyData, error: currencyError, isLoading} = useSWR(
        userInfo?.accountNo ? `/api/customers/get-person-balances?accountNo=${userInfo.accountNo}` : null,
        async (url) => {
            try {
                console.log('Fetching currency data from:', url);
                const response = await fetchData(url);
                console.log('Currency data response:', response);
                return response;
            } catch (error) {
                console.error('Error fetching currency data:', error);
                throw error;
            }
        },
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
        }
    );

    // Debug account info
    useEffect(() => {
        if (userInfo) {
            console.log('Current user account info:', {
                accountNo: userInfo.accountNo,
                fullname: userInfo.fullname,
                accountType: userInfo.accountType
            });
        }
    }, [userInfo]);

    // Define table columns
    const columns = [
        {
            title: 'Currency',
            dataIndex: 'currency',
            key: 'currency',
            render: (currency) => currency || 'N/A',
        },
        {
            title: 'Balance',
            dataIndex: 'balance',
            key: 'balance',
            render: (balance, record) => {
                const currency = record.currency || 'USD'; // Default to USD if not specified
                const amount = parseFloat(balance) || 0;
                
                try {
                    return new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: currency,
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    }).format(amount);
                } catch (error) {
                    console.warn(`Error formatting currency (${currency}):`, error);
                    // Fallback to simple number formatting if currency is invalid
                    return new Intl.NumberFormat('en-US', {
                        style: 'decimal',
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    }).format(amount);
                }
            },
            align: 'right',
        },
    ];

    return (
        <CustomerLayout>
            <Space direction="vertical" style={{ width: '100%' }} size="large">
                {/* Summary Statistics */}
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} md={8}>
                        <Card>
                            <Statistic
                                title="Total Transactions"
                                value={trData?.totalTransactions || 0}
                                prefix={<TransactionOutlined />}
                                valueStyle={{ color: '#1890ff' }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                        <Card>
                            <Statistic
                                title="Total Credits"
                                value={trData?.creditCount || 0}
                                valueStyle={{ color: '#52c41a' }}
                                prefix={<ArrowUpOutlined />}
                                suffix={`transactions`}
                            />
                    
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                        <Card>
                            <Statistic
                                title="Total Debits"
                                value={trData?.debitCount || 0}
                                valueStyle={{ color: '#f5222d' }}
                                prefix={<ArrowDownOutlined />}
                                suffix="transactions"
                            />
                          
                        </Card>
                    </Col>
                </Row>

                {/* Existing Account Balances and Recent Transactions */}
                <Card 
                    title={<Title level={4} style={{ margin: 0 }}>Account Balances</Title>}
                    style={{ marginTop: 24 }}
                >
                    {!userInfo?.accountNo ? (
                        <p>No account information available. Please log in again.</p>
                    ) : currencyError ? (
                        <p>Error loading account balances. Please try again later.</p>
                    ) : (
                        <Table
                            columns={columns}
                            dataSource={Array.isArray(currencyData) ? currencyData : []}
                            rowKey={(record, index) => index}
                            loading={{
                                spinning: isLoading,
                                indicator: <LoadingOutlined style={{ fontSize: 24 }} spin />,
                            }}
                            locale={{
                                emptyText: 'No currency balances found for this account.'
                            }}
                            pagination={false}
                        />
                    )}
                </Card>
            </Space>
        </CustomerLayout>
    )
}

export default CustomerDashboard;