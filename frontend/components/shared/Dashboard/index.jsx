import React, { useEffect, useState } from 'react';
import { Card, message, Typography, Row, Col, Spin, Tag } from 'antd';
import { 
    DollarOutlined, 
    ArrowUpOutlined, 
    ArrowDownOutlined,
    LoadingOutlined
} from '@ant-design/icons';
import { http } from '../../../modules/modules';

const { Title } = Typography;

const getCurrencySymbol = (currency) => {
    switch (currency) {
        case 'USD':
            return '$';
        case 'EUR':
            return '€';
        case 'GBP':
            return '£';
        default:
            return '$';
    }
};

const Dashboard = () => {
    const [currencyData, setCurrencyData] = useState([]);
    const [specialAccounts, setSpecialAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [messageApi, contextHolder] = message.useMessage();

    // Fetch currency data with balances
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const httpReq = http();
                
                // Fetch customers
                const { data: customers } = await httpReq.get("/api/customers");

                // Helper to format account number
                const formatAcc = (num)=>String(num||'').padStart(15,'0');

                // Identify special accounts by accountType
                const specialAcc = customers.data.filter(acc => {
                    const type = (acc.accountType || '').toLowerCase();
                    return type === 'bank' || type === 'store';
                });

                setSpecialAccounts(specialAcc.map(acc => ({
                    ...acc,
                    accountNo: formatAcc(acc.accountNo)
                })));

                // Exclude special accounts from aggregate calculations
                const regularCustomers = customers.data.filter(acc => {
                    const type = (acc.accountType || '').toLowerCase();
                    return !(type === 'bank' || type === 'store');
                });

                // Fetch Aziz Bank data first
                const { data: currencies } = await httpReq.get("/api/currency");
                
                // Fetch balance for each currency using regular customers only
                const balances = await Promise.all(
                    currencies.data.map(async (currency) => {
                        try {
                            // Get balances for regular customers only
                            const totalBalance = regularCustomers.reduce((sum, customer) => {
                                const balanceObj = customer.balances?.find(b => b.currency === currency.currencyName);
                                return sum + (balanceObj?.balance || 0);
                            }, 0);

                            const peopleOweMe = regularCustomers.reduce((sum, customer) => {
                                const balanceObj = customer.balances?.find(b => b.currency === currency.currencyName);
                                return balanceObj?.balance < 0 ? sum + Math.abs(balanceObj.balance) : sum;
                            }, 0);

                            const iOwePeople = regularCustomers.reduce((sum, customer) => {
                                const balanceObj = customer.balances?.find(b => b.currency === currency.currencyName);
                                return balanceObj?.balance > 0 ? sum + balanceObj.balance : sum;
                            }, 0);

                            return {
                                currency: currency.currencyName,
                                symbol: currency.symbol || '$',
                                total: totalBalance,
                                peopleOweMe,
                                iOwePeople
                            };
                        } catch (error) {
                            console.error(`Error processing ${currency.currencyName}:`, error);
                            return {
                                currency: currency.currencyName,
                                symbol: currency.symbol || '$',
                                total: 0,
                                peopleOweMe: 0,
                                iOwePeople: 0
                            };
                        }
                    })
                );
                
                setCurrencyData(balances);
            } catch (error) {
                console.error('Error fetching data:', error);
                messageApi.error('Failed to load data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Process currency data
    const processCurrencyData = () => {
        let totalPeopleOweMe = 0;
        let totalIOwePeople = 0;
        const processedData = [];
        
        // First pass: calculate totals and process data
        currencyData.forEach(currency => {
            const peopleOweMe = Math.abs(currency.peopleOweMe || 0);
            const iOwePeople = Math.abs(currency.iOwePeople || 0);
            
            totalPeopleOweMe += peopleOweMe;
            totalIOwePeople += iOwePeople;
            
            if (peopleOweMe > 0 || iOwePeople > 0) {
                processedData.push({
                    ...currency,
                    peopleOweMe,
                    iOwePeople
                });
            }
        });
        
        // Get primary currency symbol
        const primaryCurrency = currencyData[0]?.currency || 'USD';
        const primarySymbol = getCurrencySymbol(primaryCurrency);
        
        return {
            processedData,
            totalPeopleOweMe: `${primarySymbol} ${totalPeopleOweMe.toFixed(2)}`,
            totalIOwePeople: `${primarySymbol} ${totalIOwePeople.toFixed(2)}`,
            hasPeopleOweMe: totalPeopleOweMe > 0,
            hasIOwePeople: totalIOwePeople > 0
        };
    };

    const { 
        processedData,
        totalPeopleOweMe, 
        totalIOwePeople, 
        hasPeopleOweMe, 
        hasIOwePeople 
    } = processCurrencyData();

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-6">
            {contextHolder}
            <Title level={2} className="text-2xl font-bold text-gray-800 mb-6">
                Dashboard Overview
            </Title>

            {specialAccounts.length > 0 && (
              <Row gutter={[16,16]} className="mb-8">
                {specialAccounts.map(acc => (
                  <Col key={acc._id} xs={24} sm={12} md={8}>
                    <Card
                      size="small"
                      title={<div className="flex items-center"><DollarOutlined className="text-green-500 mr-2"/><span>{acc.fullname || `Account ${acc.accountNo}`}</span></div>}
                      className="shadow-lg"
                    >
                      {acc.balances?.map((bal,i)=>(
                        <div key={i} className="flex justify-between items-center py-2">
                          <span>{bal.currency}</span>
                          <span className="font-semibold">
                            {Number(bal.balance).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}
                          </span>
                        </div>
                      ))}
                    </Card>
                  </Col>
                ))}
              </Row>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* People Owe Me Card */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-transform duration-300 hover:shadow-xl">
                    <div className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">خلک ما  پوروړي دي</h3>
                                
                            </div>
                            <div className="bg-green-100 p-3 rounded-full">
                                <ArrowDownOutlined className="text-green-600 text-xl" />
                            </div>
                        </div>
                        
                        <div className="mt-6 pt-4 border-t border-gray-100">
                            <h4 className="text-gray-500 text-sm font-medium mb-3">By Currency</h4>
                            <div className="space-y-2">
                                {processedData
                                    .filter(item => item.peopleOweMe > 0)
                                    .map((item, index) => {
                                        const symbol = getCurrencySymbol(item.currency);
                                        return (
                                            <div key={index} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg">
                                                <span className="text-gray-600">{item.currency}</span>
                                                <span className="font-medium text-gray-800">
                                                     {item.peopleOweMe.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </span>
                                            </div>
                                        );
                                    })}
                                {!hasPeopleOweMe && (
                                    <div className="text-center py-4 text-gray-400">
                                        No amounts owed to you
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* I Owe People Card */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-transform duration-300 hover:shadow-xl">
                    <div className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">زه د خلکو  پوروړی یم</h3>
                                
                            </div>
                            <div className="bg-red-100 p-3 rounded-full">
                                <ArrowUpOutlined className="text-red-600 text-xl" />
                            </div>
                        </div>
                        
                        <div className="mt-6 pt-4 border-t border-gray-100">
                            <h4 className="text-gray-500 text-sm font-medium mb-3">By Currency</h4>
                            <div className="space-y-2">
                                {processedData
                                    .filter(item => item.iOwePeople > 0)
                                    .map((item, index) => {
                                        const symbol = getCurrencySymbol(item.currency);
                                        return (
                                            <div key={index} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg">
                                                <span className="text-gray-600">{item.currency}</span>
                                                <span className="font-medium text-gray-800">
                                                     {item.iOwePeople.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </span>
                                            </div>
                                        );
                                    })}
                                {!hasIOwePeople && (
                                    <div className="text-center py-4 text-gray-400">
                                        No amounts you owe
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;