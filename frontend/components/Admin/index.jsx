import React, { useEffect, useState } from "react";
import { Card, Spin, Typography } from "antd";
import { http,fetchData } from "../../modules/modules";
import AdminLayout from "../layout/Adminlayout/index"
import useSWR from 'swr';
import { BankOutlined, UserOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const CurrencySummaryCard = () => {
  // 

    const { data: storeData, error: storeError } = useSWR(
    "/api/customers/store-account",
    fetchData,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      refreshInterval: 1200000,
    }
  );

  // useSWR د bank ډیټا لپاره
  const { data: bankData, error: bankError } = useSWR(
    "/api/customers/bank-account",
    fetchData,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      refreshInterval: 1200000,
    }
  );

  // loading حالتونه
  const loadingStore = !storeData && !storeError;
  const loadingBank = !bankData && !bankError;

  // bankGroupedData د bankData په بدلولو سره جوړوه
  const [bankGroupedData, setBankGroupedData] = React.useState({});

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

  // مجموعي حسابونه (storeTotals, bankTotals)
  const storeTotals = {};
  if (Array.isArray(storeData)) {
    storeData.forEach((item) => {
      if (item.currency && item.TotalStoreMoney > 0) {
        storeTotals[item.currency] = (storeTotals[item.currency] || 0) + item.TotalStoreMoney;
      }
    });
  }

  const bankTotals = {};
  if (Array.isArray(bankData)) {
    bankData.forEach((item) => {
      if (item.currency && item.balance > 0) {
        bankTotals[item.currency] = (bankTotals[item.currency] || 0) + item.balance;
      }
    });
  }
  return (
    <AdminLayout>
    <div className="space-y-6">
{/* ✅ Total Money by Currency (Store + Bank) */}
{!loadingStore && !loadingBank && (
  <Card
    title="💰ټولی پیسی (دوکان + بانک) "
    className="rounded-2xl shadow-md border border-gray-100"
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
          {Object.keys({ ...storeTotals, ...bankTotals }).map((currency) => {
            const store = storeTotals[currency] || 0;
            const bank = bankTotals[currency] || 0;
            const total = store + bank;
            return (
              <tr
                key={currency}
                className="hover:bg-blue-50 transition-colors duration-200"
              >
                <td className="py-2 px-3 border-b">{currency}</td>
                <td className="py-2 px-3 border-b font-bold text-black">
                  {format(total)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  </Card>
)}

<Card
  title="🏦 د بانک مالی لنډیز "
  className="rounded-2xl shadow-md border border-gray-100"
  style={{ backgroundColor: "#f9fbff" }}
  headStyle={{ fontSize: 18, fontWeight: 600 }}
>
  {loadingBank ? (
    <div className="text-center py-10">
      <Spin size="large" />
    </div>
  ) : Object.keys(bankGroupedData).length === 0 ? (
    <p className="text-center text-gray-500 py-6">No bank data available</p>
  ) : (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Object.entries(bankGroupedData).map(([bankName, currencies], index) => (
        <div
          key={index}
          className="bg-white rounded-xl p-4 shadow hover:shadow-md transition-all"
        >
          <Title level={5} className="mb-4">
            🏦 {bankName}
          </Title>

          {/* Table */}
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


    {!loadingStore && Object.keys(storeTotals).length > 0 && (
  <Card
    title="📊 دوکان نقدی پیسی"
    className="rounded-2xl shadow-md border border-gray-100"
    style={{ backgroundColor: "#fefefe" }}
    headStyle={{ fontSize: 18, fontWeight: 600 }}
  >
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
  </Card>
)}

      {/* Store Detailed Cards */}
      <div className="flex flex-col lg:flex-row gap-6 w-full">
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
