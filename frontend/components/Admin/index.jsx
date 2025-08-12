import React, { useEffect, useState } from "react";
import { Card, Spin, Typography } from "antd";
import { http,fetchData } from "../../modules/modules";
import AdminLayout from "../layout/Adminlayout/index"
import useSWR from 'swr';
import { BankOutlined, UserOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const CurrencySummaryCard = () => {
  // 

    // د store ډیټا
  const { data: storeData, error: storeError } = useSWR(
    "/api/customers/store-account",
    fetchData,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      refreshInterval: 1200000,
    }
  );

  // د bank ډیټا
  const { data: bankData, error: bankError } = useSWR(
    "/api/customers/bank-account",
    fetchData,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      refreshInterval: 1200000,
    }
  );

  // Fetch transaction summary
  const { data: transactionSummary } = useSWR(
    "/api/transaction/summary",
    fetchData,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      refreshInterval: 300000, // 5 minutes
    }
  );

  const loadingStore = !storeData && !storeError;
  const loadingBank = !bankData && !bankError;

  // د بانک ډیټا د بانک نوم له مخې ګروپ کول
  const [bankGroupedData, setBankGroupedData] = useState({});
  useEffect(() => {
    if (Array.isArray(bankData)) {
      const grouped = bankData.reduce((acc, item) => {
        const bankName = item.fullname || "Unknown Bank";
        if (!acc[bankName]) acc[bankName] = [];
        acc[bankName].push(item);
        return acc;
      }, {});
      setBankGroupedData(grouped);
    } else {
      setBankGroupedData({});
    }
  }, [bankData]);

  const format = (num) =>
    (num || 0).toLocaleString("en-US", { minimumFractionDigits: 2 });

  // د store مجموعي پیسې
  const storeTotals = {};
  if (Array.isArray(storeData)) {
    storeData.forEach((item) => {
      if (item.currency) {
        storeTotals[item.currency] =
          (storeTotals[item.currency] || 0) + (item.TotalStoreMoney || 0);
      }
    });
  }

  // د bank مجموعي پیسې
  const bankTotals = {};
  if (Array.isArray(bankData)) {
    bankData.forEach((item) => {
      if (item.currency) {
        bankTotals[item.currency] =
          (bankTotals[item.currency] || 0) + (item.balance || 0);
      }
    });
  }

  // Store + Bank = Combined Totals
  const combinedTotals = {};
  const allCurrencies = new Set([
    ...Object.keys(storeTotals),
    ...Object.keys(bankTotals),
  ]);
  allCurrencies.forEach((currency) => {
    combinedTotals[currency] =
      (storeTotals[currency] || 0) + (bankTotals[currency] || 0);
  });

  // Calculate total transactions
  const totalTransactions = (storeData?.length || 0) + (bankData?.length || 0);
  const totalAmount = Object.values(combinedTotals).reduce((sum, amount) => sum + amount, 0);

  // Calculate transaction summary
  const transactionTotalTransactions = transactionSummary?.totalTransactions || 0;
  const transactionTotalDebit = transactionSummary?.totalDebit || 0;
  const transactionTotalCredit = transactionSummary?.totalCredit || 0;
  const transactionBalance = transactionSummary?.balance || 0;

  return (
    <AdminLayout>
    <div className="space-y-6">
 


  <div className="flex gap-6">
  {/* زه د خلکو پوروړی یم */}
  <Card
    title="زه د خلکو پوروړی یم"
    className="flex-1 rounded-2xl shadow-md border border-green-100"
    style={{ backgroundColor: "#f0fdf4" }}
    headStyle={{ fontSize: 18, fontWeight: 600 }}
  >
    {Object.entries(storeTotals).filter(([_, amount]) => amount > 0).length > 0 ? (
      <table className="min-w-full border text-left text-sm">
        <thead className="bg-green-50">
          <tr>
            <th className="py-2 px-3 border-b">کرنسي</th>
            <th className="py-2 px-3 border-b text-green-600">مقدار</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(storeTotals)
            .filter(([_, amount]) => amount > 0)
            .map(([currency, amount]) => (
              <tr key={`positive-${currency}`} className="hover:bg-green-100">
                <td className="py-2 px-3 border-b font-semibold">{currency}</td>
                <td className="py-2 px-3 border-b text-green-600 font-mono">+{format(amount)}</td>
              </tr>
            ))}
        </tbody>
      </table>
    ) : (
      <p className="text-center py-4 text-gray-600">اوس مهال هیڅ پوروړتیا نشته</p>
    )}
  </Card>

  {/* خلک د ما پورو‌ړی دی */}
  <Card
    title="خلک د ما پورو‌ړی دی"
    className="flex-1 rounded-2xl shadow-md border border-red-100"
    style={{ backgroundColor: "#fef2f2" }}
    headStyle={{ fontSize: 18, fontWeight: 600 }}
  >
    {Object.entries(storeTotals).filter(([_, amount]) => amount < 0).length > 0 ? (
      <table className="min-w-full border text-left text-sm">
        <thead className="bg-red-50">
          <tr>
            <th className="py-2 px-3 border-b">کرنسي</th>
            <th className="py-2 px-3 border-b text-red-600">مقدار</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(storeTotals)
            .filter(([_, amount]) => amount < 0)
            .map(([currency, amount]) => (
              <tr key={`negative-${currency}`} className="hover:bg-red-100">
                <td className="py-2 px-3 border-b font-semibold">{currency}</td>
                <td className="py-2 px-3 border-b text-red-600 font-mono">{format(amount)}</td>
              </tr>
            ))}
        </tbody>
      </table>
    ) : (
      <p className="text-center py-4 text-gray-600">ته اوس مهال هیڅ پوروړی نه یې</p>
    )}
  </Card>

  {/* ✅ Transaction Summary Card */}
<Card className="flex-1 rounded-2xl shadow-md p-6">
  <h3 className="text-lg font-semibold mb-4 text-center">د معاملو لنډيز</h3>
  <div className="overflow-x-auto">
    <table className="min-w-full border text-left text-sm">
      <thead className="bg-gray-100">
        <tr>
          <th className="py-2 px-3 border-b">تشريح</th>
          <th className="py-2 px-3 border-b text-right">شمېر</th>
        </tr>
      </thead>
      <tbody>
        <tr className="hover:bg-blue-50 transition-colors duration-200">
          <td className="py-2 px-3 border-b">ټولې معاملې</td>
          <td className="py-2 px-3 border-b font-bold text-right text-blue-700">{transactionTotalTransactions}</td>
        </tr>
        <tr className="hover:bg-green-50 transition-colors duration-200">
          <td className="py-2 px-3 border-b">Total Credit</td>
          <td className="py-2 px-3 border-b font-semibold text-right text-green-700">{transactionSummary?.creditCount || 0}</td>
        </tr>
        <tr className="hover:bg-red-50 transition-colors duration-200">
          <td className="py-2 px-3 border-b">د لګښت ټولې معاملې</td>
          <td className="py-2 px-3 border-b font-semibold text-right text-red-700">{transactionSummary?.debitCount || 0}</td>
        </tr>
      </tbody>
    </table>
  </div>
</Card>


</div>


      {!loadingStore && !loadingBank && (
  <div className="">
    {/* Store Totals Card */}
    

    {/* Combined Totals Card */}
    <Card
      title="💰ټولې پیسې (دوکان + بانک)"
      className="rounded-2xl shadow-md border border-gray-100 flex-1"
      style={{ backgroundColor: "#fefefe" }}
      headStyle={{ fontSize: 18, fontWeight: 600 }}
    >
      <div className="overflow-x-auto">
        <table className="min-w-full border text-left text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-3 border-b">Currency</th>
              <th className="py-2 px-3 border-b">💰 Total</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(combinedTotals).map((currency) => (
              <tr
                key={currency}
                className="hover:bg-blue-50 transition-colors duration-200"
              >
                <td className="py-2 px-3 border-b">{currency}</td>
                <td className="py-2 px-3 border-b font-bold text-black">
                  {format(combinedTotals[currency])}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  </div>
)}


      <Card
  title="🏦 د بانک + دوکان مالی لنډیز"
  className="rounded-2xl shadow-md border border-gray-100"
  style={{ backgroundColor: "#f9fbff" }}
  headStyle={{ fontSize: 18, fontWeight: 600 }}
>
  {loadingBank || loadingStore ? (
    <div className="text-center py-10">
      <Spin size="large" />
    </div>
  ) : Object.keys(bankGroupedData).length === 0 && Object.keys(storeTotals).length === 0 ? (
    <p className="text-center text-gray-500 py-6">No data available</p>
  ) : (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      
      {/* Store Totals Section */}
      <div className="bg-white rounded-xl p-4 shadow hover:shadow-md transition-all">
        <Title level={5} className="mb-4">📊 دوکان نقدی پیسی</Title>
        <div className="overflow-x-auto">
          <table className="min-w-full border text-left text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-2 px-3 border-b">Currency</th>
                <th className="py-2 px-3 border-b">Store Total</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(storeTotals).map(([currency, total], index) => (
                <tr
                  key={index}
                  className="hover:bg-blue-50 transition-colors duration-200"
                >
                  <td className="py-2 px-3 border-b">{currency}</td>
                  <td className="py-2 px-3 border-b font-medium text-black">
                    {format(total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bank Data Section */}
      {Object.entries(bankGroupedData).map(([bankName, currencies], index) => (
        <div
          key={index}
          className="bg-white rounded-xl p-4 shadow hover:shadow-md transition-all"
        >
          <Title level={5} className="mb-4">🏦 {bankName}</Title>
          <div className="overflow-x-auto">
            <table className="min-w-full border text-left text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-2 px-3 border-b">#</th>
                  <th className="py-2 px-3 border-b">Currency</th>
                  <th className="py-2 px-3 border-b">Balance</th>
                </tr>
              </thead>
              <tbody>
                {currencies.map((item, i) => (
                  <tr
                    key={i}
                    className="hover:bg-blue-50 transition-colors duration-200"
                  >
                    <td className="py-2 px-3 border-b">{i + 1}</td>
                    <td className="py-2 px-3 border-b">{item.currency}</td>
                    <td className="py-2 px-3 border-b font-medium text-right">
                      {format(item.balance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}

    </div>
  )}
</Card>



  

      {/* Store Detailed Cards */}
      <div className="flex flex-col lg:flex-row gap-6 w-full m-7">
      {/* 👤 Customer Money Card */}
      <Card
        title="👤 د مشتری پیسې"
        className="rounded-2xl shadow-md w-full lg:w-1/2"
        style={{ background: "linear-gradient(to bottom, #f5f3ff, #ffffff)" }}
        headStyle={{ textAlign: "center", fontWeight: "bold", fontSize: 18 }}
      >
        {loadingStore ? (
          <div className="text-center py-10">
            <Spin size="large" />
          </div>
        ) : storeData.length === 0 ? (
          <p className="text-center text-gray-500 py-6">هیڅ معلومات نشته</p>
        ) : (
          <div className="space-y-4">
            {storeData
              .filter((item) => item.CustomerMoney > 0)
              .map((item, index) => (
                <div
                  key={`customer-${index}`}
                  className="flex justify-between items-center border-b pb-2"
                >
                  <span className="text-sm text-gray-700 flex items-center gap-1">
                    <UserOutlined /> {item.currency}
                  </span>
                  <Text className="font-semibold text-blue-600 text-base">
                    {format(item.CustomerMoney)}
                  </Text>
                </div>
              ))}
          </div>
        )}
      </Card>

      {/* 🏦 Owner Money Card */}
      <Card
        title="🏦 د څښتن پیسې"
        className="rounded-2xl shadow-md w-full lg:w-1/2"
        style={{ background: "linear-gradient(to bottom, #f0fdf4, #ffffff)" }}
        headStyle={{ textAlign: "center", fontWeight: "bold", fontSize: 18 }}
      >
        {loadingStore ? (
          <div className="text-center py-10">
            <Spin size="large" />
          </div>
        ) : storeData.length === 0 ? (
          <p className="text-center text-gray-500 py-6">هیڅ معلومات نشته</p>
        ) : (
          <div className="space-y-4">
            {storeData
              .filter((item) => item.OwnerMoney > 0)
              .map((item, index) => (
                <div
                  key={`owner-${index}`}
                  className="flex justify-between items-center border-b pb-2"
                >
                  <span className="text-sm text-gray-700 flex items-center gap-1">
                    <BankOutlined /> {item.currency}
                  </span>
                  <Text className="font-semibold text-green-600 text-base">
                    {format(item.OwnerMoney)}
                  </Text>
                </div>
              ))}
          </div>
        )}
      </Card>
    </div>

    </div>
    </AdminLayout>
  );
};
export default CurrencySummaryCard;
