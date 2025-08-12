import React, { useEffect, useState } from 'react';
import { Table, message, Button, Modal, Form, InputNumber, Select, Checkbox } from 'antd';
import { http } from '../../../modules/modules';
import Adminlayout from '../../layout/Adminlayout';

const { Option } = Select;

const RatePage = () => {
  const [rates, setRates] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  // To show/hide sell and buy inputs
  const [showSell, setShowSell] = useState(false);
  const [showBuy, setShowBuy] = useState(false);

  useEffect(() => {
    fetchRates();
    fetchCurrencies();
  }, []);

  const fetchRates = async () => {
    setLoading(true);
    try {
      const httpReq = http();
      const { data } = await httpReq.get('/api/exchange-rate/rates');
      if (data && data.data) {
        setRates(data.data);
      }
    } catch (err) {
      message.error('Failed to load exchange rates');
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrencies = async () => {
    try {
      const httpReq = http();
      const { data } = await httpReq.get('/api/currency');
      if (data && data.data) {
        setCurrencies(data.data);
      }
    } catch {
      message.error('Failed to load currencies');
    }
  };

  const showModal = () => {
    setModalVisible(true);
    setShowSell(false);
    setShowBuy(false);
    form.resetFields();
  };

  const handleCancel = () => {
    setModalVisible(false);
    setShowSell(false);
    setShowBuy(false);
    form.resetFields();
  };

  const handleUpdateRate = async () => {
    try {
      const values = await form.validateFields();
      const httpReq = http();

      // Prepare the request data based on which rates are being updated
      const requests = [];
      
      if (showSell && values.sellRate) {
        requests.push(
          httpReq.put('/api/exchange-rate/rates', {
            fromCurrency: values.fromCurrency,
            toCurrency: values.toCurrency,
            rate: parseFloat(values.sellRate),
            rateType: 'sell'
          })
        );
      }

      if (showBuy && values.buyRate) {
        requests.push(
          httpReq.put('/api/exchange-rate/rates', {
            fromCurrency: values.fromCurrency,
            toCurrency: values.toCurrency,
            rate: parseFloat(values.buyRate),
            rateType: 'buy'
          })
        );
      }

      if (requests.length === 0) {
        message.warning('Please select at least one rate type to update');
        return;
      }

      // Execute all update requests
      await Promise.all(requests);
      
      message.success('Exchange rates updated successfully!');
      handleCancel();
      fetchRates();
    } catch (error) {
      console.error('Update error:', error);
      message.error(error.response?.data?.message || 'Failed to update rates');
    }
  };

  const columns = [
    {
      title: 'From Currency',
      dataIndex: 'fromCurrency',
      key: 'fromCurrency',
    },
    {
      title: 'To Currency',
      dataIndex: 'toCurrency',
      key: 'toCurrency',
    },
    {
      title: 'Sell Rate',
      dataIndex: 'sellRate',
      key: 'sellRate',
    },
    {
      title: 'Buy Rate',
      dataIndex: 'buyRate',
      key: 'buyRate',
    },
  ];

  return (
    <Adminlayout>
      <div>
        <Button type="primary" onClick={showModal} style={{ marginBottom: 16 }}>
          Update Exchange Rate
        </Button>

        <Table
          columns={columns}
          dataSource={rates}
          rowKey={(record) => `${record.fromCurrency}-${record.toCurrency}`}
          loading={loading}
          pagination={{ pageSize: 10 }}
        />

        <Modal
          visible={modalVisible}
          title="Update Exchange Rate"
          onCancel={handleCancel}
          onOk={handleUpdateRate}
        >
          <Form form={form} layout="vertical">
            <Form.Item
              name="fromCurrency"
              label="From Currency"
              rules={[{ required: true, message: 'Please select from currency' }]}
            >
              <Select placeholder="Select currency">
                {currencies.map((c) => (
                  <Option key={c._id} value={c.currencyName}>
                    {c.currencyName} - {c.currencyDesc}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="toCurrency"
              label="To Currency"
              rules={[{ required: true, message: 'Please select to currency' }]}
            >
              <Select placeholder="Select currency">
                {currencies.map((c) => (
                  <Option key={c._id} value={c.currencyName}>
                    {c.currencyName} - {c.currencyDesc}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            {/* Checkboxes to select Sell and/or Buy */}
            <div style={{ marginBottom: 10 }}>
              <Checkbox checked={showSell} onChange={(e) => setShowSell(e.target.checked)}>
                Sell
              </Checkbox>
              <Checkbox checked={showBuy} onChange={(e) => setShowBuy(e.target.checked)} style={{ marginLeft: 20 }}>
                Buy
              </Checkbox>
            </div>

            {/* Sell input */}
            {showSell && (
              <Form.Item
                name="sellRate"
                label="Sell Rate"
                rules={[
                  { required: true, message: 'Please enter sell rate' },
                  { pattern: /^\d+(\.\d+)?$/, message: 'Enter a valid number' },
                ]}
              >
                <InputNumber style={{ width: '100%' }} placeholder="Enter sell rate" min={0} step={0.0001} />
              </Form.Item>
            )}

            {/* Buy input */}
            {showBuy && (
              <Form.Item
                name="buyRate"
                label="Buy Rate"
                rules={[
                  { required: true, message: 'Please enter buy rate' },
                  { pattern: /^\d+(\.\d+)?$/, message: 'Enter a valid number' },
                ]}
              >
                <InputNumber style={{ width: '100%' }} placeholder="Enter buy rate" min={0} step={0.0001} />
              </Form.Item>
            )}
          </Form>
        </Modal>
      </div>
    </Adminlayout>
  );
};

export default RatePage;
