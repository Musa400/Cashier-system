import { Card, Button, Divider, message } from "antd";
import {
    DollarOutlined,
    ArrowUpOutlined,
    ArrowDownOutlined,
    WalletOutlined,
    LoadingOutlined
} from "@ant-design/icons";
import { useEffect, useState } from 'react';
import { http } from '../../../modules/modules';

const Dashboard = ({ data }) => {
    const [currencyData, setCurrencyData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [messageApi, contextHolder] = message.useMessage();

    // Fetch active currencies and their balances
    useEffect(() => {
        const fetchCurrencyData = async () => {
            try {
                setLoading(true);
                const httpReq = http();
                
                // Fetch all active currencies
                const { data: currencies } = await httpReq.get("/api/currency");
                
                // For each currency, fetch the balance data
                const currencyBalances = await Promise.all(
                    currencies.data.map(async (currency) => {
                        try {
                            // Use the new balance endpoint
                            const { data: balanceData } = await httpReq.get(`/api/balance?currency=${encodeURIComponent(currency.currencyName)}`);
                            return {
                                currency: currency.currencyName,
                                total: balanceData?.total || 0,
                                peopleOweMe: balanceData?.peopleOweMe || 0,
                                iOwePeople: balanceData?.iOwePeople || 0,
                            };
                        } catch (error) {
                            console.error(`Error fetching balance for ${currency.currencyName}:`, error);
                            return {
                                currency: currency.currencyName,
                                total: 0,
                                peopleOweMe: 0,
                                iOwePeople: 0,
                            };
                        }
                    })
                );

                setCurrencyData(currencyBalances);
            } catch (error) {
                console.error('Error fetching currency data:', error);
                messageApi.error('Failed to load currency data');
            } finally {
                setLoading(false);
            }
        };

        fetchCurrencyData();
    }, []);

    // Helper function to get currency symbol
    const getCurrencySymbol = (currency) => {
        const symbols = {
            'USD': '$', 'EUR': '€', 'GBP': '£', 'JPY': '¥',
            'CNY': '¥', 'INR': '₹', 'AFN': '؋', 'PKR': '₨',
            'SAR': '﷼', 'AED': 'د.إ', 'CAD': 'C$', 'AUD': 'A$',
            'CHF': 'CHF', 'TRY': '₺', 'RUB': '₽', 'BRL': 'R$',
            'MXN': 'Mex$', 'NGN': '₦', 'ZAR': 'R', 'KRW': '₩',
            'HKD': 'HK$', 'MYR': 'RM', 'SGD': 'S$', 'THB': '฿',
            'EGP': 'E£', 'ILS': '₪', 'KWD': 'KD', 'QAR': 'QR',
            'OMR': 'OMR', 'MKD': 'ден'
        };
        return symbols[currency] || currency;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <LoadingOutlined style={{ fontSize: 48 }} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {contextHolder}
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Currency Balances</h1>
            {/* Currency Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                {currencyData.length > 0 ? (
                    currencyData.map((currencyItem) => {
                        const { currency, total, peopleOweMe, iOwePeople } = currencyItem;
                        const symbol = getCurrencySymbol(currency);
                        const title = `Balance Summary - ${currency}`;
                        
                        return (
                            <Card 
                                key={currency} 
                                className="shadow-lg hover:shadow-xl transition-shadow"
                                title={
                                    <div className="flex items-center">
                                        <WalletOutlined className="mr-2 text-blue-500" />
                                        <span>{title}</span>
                                    </div>
                                }
                                headStyle={{ borderBottom: '1px solid #f0f0f0' }}
                            >
                                {/* Total */}
                                <div className="mb-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-gray-600">Total Balance</span>
                                        {/* <span className={`text-base font-semibold ${
                                            total >= 0 ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                            {symbol} {Math.abs(total).toLocaleString(undefined, {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2
                                            })}
                                        </span> */}
                                        <span className={`text-base font-semibold ${
                                            total >= 0 ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                           {symbol} {iOwePeople.toLocaleString(undefined, {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2
                                            })}
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-3">
                                    {/* People Owe Me */}
                                    <div className="bg-green-50 p-3 rounded-lg">
                                        <div className="flex items-center text-green-600 text-sm mb-1">
                                            <ArrowDownOutlined className="mr-1" />
                                            <span>People Owe Me</span>
                                        </div>
                                        <div className="font-semibold text-green-700">
                                            {symbol} {peopleOweMe.toLocaleString(undefined, {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2
                                            })}
                                        </div>
                                    </div>
                                    
                                    {/* I Owe People */}
                                    <div className="bg-red-50 p-3 rounded-lg">
                                        <div className="flex items-center text-red-600 text-sm mb-1">
                                            <ArrowUpOutlined className="mr-1" />
                                            <span>I Owe People</span>
                                        </div>
                                        <div className="font-semibold text-red-700">
                                            {symbol} {iOwePeople.toLocaleString(undefined, {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        );
                    })
                ) : (
                    <div className="col-span-full text-center py-8">
                        <p className="text-gray-500">No currencies found. Please add currencies from the admin panel.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;