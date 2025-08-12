import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Button, message, Typography, Table } from 'antd';
import { SwapOutlined } from '@ant-design/icons';
import { http, trimData } from '../../../modules/modules';
import { ExclamationCircleOutlined } from '@ant-design/icons';

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
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [rateType, setRateType] = useState('sell'); // 'sell' or 'buy'
  const userInfo = JSON.parse(sessionStorage.getItem("userInfo"))

  const columns = [
    { title: 'Customer', dataIndex: 'customerName', key: 'customerName' },
    { title: 'From', dataIndex: 'fromCurrency', key: 'fromCurrency' },
    { title: 'To', dataIndex: 'toCurrency', key: 'toCurrency' },
    { 
      title: 'Amount', 
      dataIndex: 'amount', 
      key: 'amount',
      render: amount => Math.round(amount)
    },
    { 
      title: 'Rate', 
      dataIndex: 'rate', 
      key: 'rate',
      render: rate => Math.round(rate * 1000) / 1000 // Show up to 3 decimal places for rate
    },
    { 
      title: 'Converted Amount', 
      dataIndex: 'convertedAmount', 
      key: 'convertedAmount',
      render: amount => amount ? Math.round(amount) : ''
    },
    { title: 'Date', dataIndex: 'date', key: 'date' },
    { title: 'Created By', dataIndex: 'createdBy', key: 'createdBy' },
  ];

  const styles = {
    errorText: {
      color: '#ff4d4f',
      fontSize: '13px',
      marginTop: '4px',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
    },
    warningIcon: {
      color: '#ff4d4f',
    },
    balanceWarning: {
      marginTop: '8px',
      padding: '10px 12px',
      background: '#fff2f0',
      border: '1px solid #ffccc7',
      borderRadius: '6px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    balanceContainer: {
      marginBottom: 24,
      padding: '16px 20px',
      background: '#ffffff',
      borderRadius: '12px',
      boxShadow: '0 2px 12px rgba(0, 0, 0, 0.05)',
      border: '1px solid #f0f0f0',
    },
    balanceTitle: {
      fontSize: '14px',
      fontWeight: 500,
      color: '#595959',
      marginBottom: '12px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    balanceGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
      gap: '12px',
    },
    balanceCard: {
      padding: '12px',
      background: 'linear-gradient(145deg, #f8f9ff, #ffffff)',
      borderRadius: '10px',
      border: '1px solid #f0f2f5',
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 4px 12px rgba(24, 144, 255, 0.12)',
      },
    },
    balanceAmount: {
      fontSize: '18px',
      fontWeight: 600,
      color: '#1890ff',
      marginBottom: '4px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    balanceCurrency: {
      fontSize: '14px',
      color: '#8c8c8c',
      fontWeight: 500,
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
    },
    currencyIcon: {
      width: '24px',
      height: '24px',
      borderRadius: '50%',
      background: '#e6f7ff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#1890ff',
      fontSize: '12px',
      fontWeight: 'bold',
    },
  };

  const getExchangeRate = (from, to, type = rateType) => {
    if (from === to) return 1;
    
    const rateObj = exchangeRates.find(
      rate => rate.fromCurrency === from && rate.toCurrency === to
    );
    
    return rateObj ? rateObj[`${type}Rate`] || rateObj.rate : null;
  };

  const handleValuesChange = (changedValues, allValues) => {
    const { fromCurrency, toCurrency, amount } = allValues;
    
    // If rate type changed, update the rate and converted amount
    if (changedValues.rateType) {
      setRateType(changedValues.rateType);
      if (fromCurrency && toCurrency) {
        const rate = getExchangeRate(fromCurrency, toCurrency, changedValues.rateType);
        if (rate !== null) {
          form.setFieldsValue({ rate });
          if (amount) {
            setConvertedAmount((amount * rate).toFixed(2));
          }
        }
      }
      return;
    }
    
    // If currencies changed, update the rate
    if (changedValues.fromCurrency || changedValues.toCurrency) {
      if (fromCurrency && toCurrency) {
        const rate = getExchangeRate(fromCurrency, toCurrency, rateType);
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
    
    // If amount changed, update the converted amount and check balance
    if ('amount' in changedValues && fromCurrency && toCurrency) {
      const rate = getExchangeRate(fromCurrency, toCurrency, rateType);
      if (rate && changedValues.amount) {
        setConvertedAmount((changedValues.amount * rate).toFixed(2));
      } else {
        setConvertedAmount(null);
      }
    }
  };

  const handleCustomerSelect = (customerId) => {
    const customer = customers.find(c => c._id === customerId);
    setSelectedCustomer(customer);
  };

  const showModal = () => setIsModalVisible(true);

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setConvertedAmount(null);
    setSelectedCustomer(null);
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
      const { data } = await httpReq.post("/api/exchange", exchangeData);
      
      console.log("Exchange response:", data);

      // Show success message with updated balances
      message.success(
        <div>
          <p>Exchange successful!</p>
          <p>
            {amount} {values.fromCurrency} = {data.data.exchange.convertedAmount.toFixed(2)} {values.toCurrency}
          </p>
          <p>
            New balances: {values.fromCurrency}: {data.data.newSourceBalance.toFixed(2)}, 
            {values.toCurrency}: {data.data.newTargetBalance.toFixed(2)}
          </p>
        </div>,
        10 // Show for 10 seconds
      );
      
      // Reset form and close modal
      form.resetFields();
      setConvertedAmount(null);
      fetchExchangeHistory();
      setIsModalVisible(false);
      
      // Refresh customer data to show updated balances
      fetchCustomers();
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

  const renderExchangeForm = () => (
    <Form
      form={form}
      layout="vertical"
      onValuesChange={handleValuesChange}
      initialValues={{ rateType: 'sell' }}
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
          onChange={handleCustomerSelect}
        >
          {customers.map(customer => (
            <Option key={customer._id} value={customer._id}>
              {customer.fullname || `${customer.firstName || ''} ${customer.lastName || ''}`.trim()}
              {customer.phone ? ` (${customer.phone})` : ''}
            </Option>
          ))}
        </Select>
      </Form.Item>

      {selectedCustomer && selectedCustomer.balances && selectedCustomer.balances.length > 0 && (
        <div style={{ marginBottom: '16px', padding: '12px', border: '1px solid #d9d9d9', borderRadius: '4px' }}>
          <Text strong>Customer Balances:</Text>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
            {selectedCustomer.balances.map((balance, index) => (
              <div key={index} style={{ 
                padding: '4px 8px', 
                background: '#f0f0f0', 
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <span>{Math.round(balance.balance)}</span>
                <span style={{ fontWeight: 'bold' }}>{balance.currency}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '16px' }}>
        <Form.Item
          name="fromCurrency"
          label="From Currency"
          rules={[{ required: true, message: 'Please select source currency' }]}
          style={{ flex: 1 }}
        >
          <Select placeholder="Select currency" loading={isLoadingRates}>
            {currencies.map(currency => (
              <Option key={currency.currencyName} value={currency.currencyName}>
                {currency.currencyName} - {currency.currencyDesc}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <div style={{ display: 'flex', alignItems: 'center', paddingTop: '30px' }}>
          <Button
            type="text"
            icon={<SwapOutlined />}
            onClick={() => {
              const from = form.getFieldValue('fromCurrency');
              const to = form.getFieldValue('toCurrency');
              form.setFieldsValue({
                fromCurrency: to,
                toCurrency: from,
              });
              // Trigger rate update
              handleValuesChange({}, form.getFieldsValue());
            }}
            disabled={!form.getFieldValue('fromCurrency') || !form.getFieldValue('toCurrency')}
          />
        </div>

        <Form.Item
          name="toCurrency"
          label="To Currency"
          rules={[{ required: true, message: 'Please select target currency' }]}
          style={{ flex: 1 }}
        >
          <Select placeholder="Select currency" loading={isLoadingRates}>
            {currencies.map(currency => (
              <Option key={currency.currencyName} value={currency.currencyName}>
                {currency.currencyName} - {currency.currencyDesc}
              </Option>
            ))}
          </Select>
        </Form.Item>
      </div>

      <Form.Item
        name="rateType"
        label="Rate Type"
        rules={[{ required: true, message: 'Please select rate type' }]}
      >
        <Select placeholder="Select rate type">
          <Option value="sell">Sell Rate</Option>
          <Option value="buy">Buy Rate</Option>
        </Select>
      </Form.Item>

      <Form.Item
        name="amount"
        label={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>Amount</span>
            {form.getFieldValue('fromCurrency') && selectedCustomer?.balances && (
              <span style={{ fontSize: '12px', color: '#8c8c8c' }}>
                (Available: {
                  selectedCustomer.balances.find(b => b.currency === form.getFieldValue('fromCurrency'))?.balance || 0
                } {form.getFieldValue('fromCurrency')})
              </span>
            )}
          </div>
        }
        rules={[
          { required: true, message: 'Please enter amount' },
          {
            pattern: /^\d+$/,
            message: 'Please enter a whole number (no decimals)',
          },
          {
            validator: (_, value) => {
              const fromCurrency = form.getFieldValue('fromCurrency');
              if (value && fromCurrency && !hasEnoughBalance(value, fromCurrency)) {
                return Promise.reject(new Error('Insufficient balance for this transaction'));
              }
              return Promise.resolve();
            },
          },
        ]}
      >
        <Input 
          type="number" 
          min="1" 
          step="1"
          placeholder="Enter amount" 
          disabled={isLoadingRates}
        />
      </Form.Item>

      {form.getFieldValue('amount') && form.getFieldValue('fromCurrency') && 
       !hasEnoughBalance(form.getFieldValue('amount'), form.getFieldValue('fromCurrency')) && (
        <div style={styles.balanceWarning}>
          <ExclamationCircleOutlined style={styles.warningIcon} />
          <span>You don't have enough {form.getFieldValue('fromCurrency')} to complete this transaction.</span>
        </div>
      )}

      <Form.Item name="rate" hidden noStyle>
        <Input type="hidden" />
      </Form.Item>

      {convertedAmount && (
        <div style={{ marginTop: '16px', padding: '12px', background: '#f6ffed', borderRadius: '4px' }}>
          <Text strong>
            {Math.round(form.getFieldValue('amount'))} {form.getFieldValue('fromCurrency')} = {Math.round(convertedAmount)} {form.getFieldValue('toCurrency')}
          </Text>
          {form.getFieldValue('fromCurrency') && form.getFieldValue('toCurrency') && (
            <div style={{ color: '#666', marginTop: '4px' }}>
              Rate: 1 {form.getFieldValue('fromCurrency')} = {form.getFieldValue('rate')} {form.getFieldValue('toCurrency')}
            </div>
          )}
        </div>
      )}
    </Form>
  );

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

  const hasEnoughBalance = (amount, fromCurrency) => {
    if (!selectedCustomer?.balances) return true;
    const balance = selectedCustomer.balances.find(b => b.currency === fromCurrency);
    return balance && parseFloat(balance.balance) >= parseFloat(amount);
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
        {renderExchangeForm()}
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
