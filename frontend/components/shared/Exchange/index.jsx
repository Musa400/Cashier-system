import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Button, message, Typography, Table } from 'antd';
import { SwapOutlined } from '@ant-design/icons';
import { http, trimData } from '../../../modules/modules';

const { Option } = Select;
const { Text } = Typography;

const CurrencyExchange = () => {
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [convertedAmount, setConvertedAmount] = useState(null);
  const [currencies, setCurrencies] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [exchangeRates, setExchangeRates] = useState([]);
  const [isLoadingRates, setIsLoadingRates] = useState(true);
  const [exchangeHistory, setExchangeHistory] = useState([]);
  const userInfo = JSON.parse(sessionStorage.getItem("userInfo"))

  const columns = [
    { title: 'Customer', dataIndex: 'customerName', key: 'customerName' },
    { title: 'From', dataIndex: 'fromCurrency', key: 'fromCurrency' },
    { title: 'To', dataIndex: 'toCurrency', key: 'toCurrency' },
    { title: 'Amount', dataIndex: 'amount', key: 'amount' },
    { title: 'Rate', dataIndex: 'rate', key: 'rate' },
    { title: 'Date', dataIndex: 'date', key: 'date' },
    { title: 'Created By', dataIndex: 'createdBy', key: 'createdBy' },
  ];

  // Fetch data when component mounts
  useEffect(() => {
    const fetchCurrenciesAndRates = async () => {
      try {
        setIsLoadingRates(true);
        const httpReq = http();
        
        // Fetch currencies
        const { data: currenciesData } = await httpReq.get("/api/currency");
        if (currenciesData && currenciesData.data) {
          setCurrencies(currenciesData.data);
        }
        
        // Fetch exchange rates
        const { data: ratesData } = await httpReq.get("/api/exchange-rate/rates");
        if (ratesData && ratesData.data) {
          setExchangeRates(ratesData.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        message.error("Failed to load exchange data");
      } finally {
        setIsLoadingRates(false);
      }
    };

    fetchCurrenciesAndRates();
    fetchExchangeHistory();
  }, []);

  // Also fetch when modal opens to ensure we have fresh data
  useEffect(() => {
    if (isModalVisible) {
      fetchCustomers();
    }
  }, [isModalVisible]);

  const fetchCustomers = async () => {
    try {
      const httpReq = http();
      const { data } = await httpReq.get("/api/customers");
      if (data && data.data) {
        setCustomers(data.data);
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
      message.error("Unable to fetch customers");
    }
  };

  const fetchExchangeHistory = async () => {
    try {
      const httpReq = http();
      const { data } = await httpReq.get("/api/exchange/history");
      
      console.log("Exchange history response:", data); // Debug log
      
      if (data && data.success && data.data) {
        const formattedData = data.data.map(item => ({
          ...item,
          key: item._id, // Make sure each item has a unique key
          date: item.date ? new Date(item.date).toLocaleString() : 'N/A',
          createdBy: item.createdBy || 'System',
          amount: parseFloat(item.amount).toFixed(2),
          rate: parseFloat(item.rate).toFixed(4)
        }));
        
        setExchangeHistory(formattedData);
      } else {
        console.error("Unexpected response format:", data);
        message.error("Unexpected response format from server");
      }
    } catch (error) {
      console.error("Error fetching exchange history:", error);
      message.error(error.response?.data?.message || "Unable to fetch exchange history");
    }
  };

  const getExchangeRate = (from, to) => {
    if (from === to) return 1;
    
    const rateObj = exchangeRates.find(
      rate => rate.fromCurrency === from && rate.toCurrency === to
    );
    
    return rateObj ? rateObj.rate : null;
  };

  const handleValuesChange = (changedValues, allValues) => {
    const { fromCurrency, toCurrency, amount } = allValues;
    
    // If currencies changed, update the rate
    if (changedValues.fromCurrency || changedValues.toCurrency) {
      if (fromCurrency && toCurrency) {
        const rate = getExchangeRate(fromCurrency, toCurrency);
        if (rate !== null) {
          form.setFieldsValue({ rate });
          if (amount) {
            setConvertedAmount((amount * rate).toFixed(2));
          }
        } else {
          form.setFieldsValue({ rate: '' });
          setConvertedAmount(null);
        }
      }
    }
    
    // If amount changed, update the converted amount
    if ('amount' in changedValues && fromCurrency && toCurrency) {
      const rate = getExchangeRate(fromCurrency, toCurrency);
      if (rate && changedValues.amount) {
        setConvertedAmount((changedValues.amount * rate).toFixed(2));
      } else {
        setConvertedAmount(null);
      }
    }
  };

  const showModal = () => setIsModalVisible(true);

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setConvertedAmount(null);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      // Find the selected customer
      const selectedCustomer = customers.find(c => c._id === values.customerId);
      if (!selectedCustomer) {
        throw new Error('Selected customer not found');
      }

      // Parse and validate amount and rate
      const amount = parseFloat(values.amount);
      const rate = parseFloat(values.rate);
      
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Please enter a valid amount');
      }
      
      if (isNaN(rate) || rate <= 0) {
        throw new Error('Invalid exchange rate');
      }

      // Prepare the exchange data
      const exchangeData = {
        customerId: selectedCustomer._id,
        customerName: selectedCustomer.fullname || `${selectedCustomer.firstName || ''} ${selectedCustomer.lastName || ''}`.trim(),
        fromCurrency: values.fromCurrency,
        toCurrency: values.toCurrency,
        amount: amount,
        rate: rate,
        createdBy: userInfo?.email || 'System',
        date: new Date()
      };

      console.log("Submitting exchange:", exchangeData);

      setIsLoading(true);
      const httpReq = http();
      const response = await httpReq.post("/api/exchange", exchangeData);
      
      console.log("Exchange response:", response);

      message.success(
        `Exchange request for ${exchangeData.customerName}: ` +
        `${exchangeData.amount} ${exchangeData.fromCurrency} to ${(exchangeData.amount * exchangeData.rate).toFixed(2)} ${exchangeData.toCurrency}`
      );
      
      form.resetFields();
      setConvertedAmount(null);
      fetchExchangeHistory();
      setIsModalVisible(false);
    } catch (error) {
      console.error("Error in exchange:", error);
      const errorMessage = error.response?.data?.message || error.message || "Exchange failed";
      message.error(errorMessage);
      
      // Log detailed error for debugging
      if (error.response) {
        console.error('Server responded with:', error.response.data);
        console.error('Status:', error.response.status);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Button
        type="primary"
        onClick={showModal}
        icon={<SwapOutlined />}
        className="mb-4"
      >
        Currency Exchange
      </Button>

      <Modal
        title="Currency Exchange"
        open={isModalVisible}
        onCancel={handleCancel}
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            icon={<SwapOutlined />}
            loading={isLoading}
            onClick={handleSubmit}
          >
            Exchange
          </Button>,
        ]}
      >
        <Form 
          form={form} 
          layout="vertical" 
          onValuesChange={handleValuesChange}
        >
          <Form.Item
            name="customerId"
            label="Select Customer"
            rules={[{ required: true, message: 'Please select a customer' }]}
          >
            <Select
              placeholder="Select customer"
              loading={customers.length === 0}
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase())
              }
            >
              {customers.map(customer => (
                <Option key={customer._id} value={customer._id}>
                  {customer.fullname || `${customer.firstName || ''} ${customer.lastName || ''}`.trim()}
                  {customer.phone ? ` (${customer.phone})` : ''}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="fromCurrency"
            label="From Currency"
            rules={[{ required: true, message: 'Please select source currency' }]}
          >
            <Select placeholder="Select currency" loading={isLoadingRates}>
              {currencies.map(currency => (
                <Option key={currency.currencyName} value={currency.currencyName}>
                  {currency.currencyName} - {currency.currencyDesc}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="toCurrency"
            label="To Currency"
            rules={[{ required: true, message: 'Please select target currency' }]}
          >
            <Select placeholder="Select currency" loading={isLoadingRates}>
              {currencies.map(currency => (
                <Option key={currency.currencyName} value={currency.currencyName}>
                  {currency.currencyName} - {currency.currencyDesc}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="amount"
            label="Amount"
            rules={[
              { required: true, message: 'Please enter amount' },
              {
                pattern: /^\d+(\.\d{1,2})?$/,
                message: 'Please enter a valid amount (e.g., 100 or 100.50)',
              },
            ]}
          >
            <Input 
              type="number" 
              step="0.01" 
              min="0" 
              placeholder="Enter amount" 
              disabled={isLoadingRates}
            />
          </Form.Item>

          <Form.Item name="rate" hidden noStyle>
            <Input type="hidden" />
          </Form.Item>

          {convertedAmount && (
            <div style={{ marginTop: '16px', padding: '12px', background: '#f6ffed', borderRadius: '4px' }}>
              <Text strong>
                {form.getFieldValue('amount')} {form.getFieldValue('fromCurrency')} = {convertedAmount} {form.getFieldValue('toCurrency')}
              </Text>
              {form.getFieldValue('fromCurrency') && form.getFieldValue('toCurrency') && (
                <div style={{ color: '#666', marginTop: '4px' }}>
                  Rate: 1 {form.getFieldValue('fromCurrency')} = {form.getFieldValue('rate')} {form.getFieldValue('toCurrency')}
                </div>
              )}
            </div>
          )}
        </Form>
      </Modal>

      {/* تبادلې تاریخ جدول د مودال نه بهر */}
      <Table
        columns={columns}
        dataSource={exchangeHistory}
        rowKey="_id"
        pagination={{ pageSize: 5 }}
        style={{ marginTop: 20 }}
      />
    </div>
  );
};

export default CurrencyExchange;
