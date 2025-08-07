import React, { useEffect, useState } from "react";
import { Card, Spin, Typography } from "antd";
import { http,fetchData } from "../../../modules/modules";
import useSWR from 'swr';

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
    <div className="space-y-6">
{/* ✅ Total Money by Currency (Store + Bank) */}
{!loadingStore && !loadingBank && (
  <Card
    title="💰 Total Money (Store + Bank)"
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
  title="🏦 Bank Financial Summary"
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
    title="📊 Total Store Money"
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
      <Card
        title="Store Financial Summary"
        className="rounded-2xl shadow-md border border-gray-100 "
        style={{ backgroundColor: "#f9fafb" }}
        headStyle={{ fontSize: 18, fontWeight: 600 }}
      >
        {loadingStore ? (
          <div className="text-center py-10">
            <Spin size="large" />
          </div>
        ) : storeData.length === 0 ? (
          <p className="text-center text-gray-500 py-6">No store data available</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {storeData
              .filter((item) => item.TotalStoreMoney > 0)
              .map((item, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl p-4 shadow hover:shadow-lg transition-all"
                >
                  <div className="flex justify-between items-center mb-2">
                    <Text className="text-sm text-gray-500">Currency</Text>
                    <Title level={5} className="!mb-0">
                      {item.currency}
                    </Title>
                  </div>

                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <Text className="text-gray-500">👤 Customer</Text>
                      <Text className="font-semibold text-blue-600">
                        {format(item.CustomerMoney)}
                      </Text>
                    </div>
                    <div className="flex justify-between">
                      <Text className="text-gray-500">🏦 Owner</Text>
                      <Text className="font-semibold text-green-600">
                        {format(item.OwnerMoney)}
                      </Text>
                    </div>
                    <div className="flex justify-between pt-2 mt-2 border-t">
                      <Text className="text-gray-700 font-medium">Total</Text>
                      <Text className="font-bold text-black">
                        {format(item.TotalStoreMoney)}
                      </Text>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </Card>

     









    </div>
  );
};
export default CurrencySummaryCard;
