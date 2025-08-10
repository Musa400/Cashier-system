import React, { useEffect, useState } from 'react';
import { Table, message, Button, Modal, Form, InputNumber, Select } from 'antd';
import { http } from '../../../modules/modules';
import Adminlayout from '../../layout/Adminlayout';

const { Option } = Select;

const RatePage = () => {
  const [rates, setRates] = useState([]); // [{ from: 'USD', to: 'AFN', rate: 85 }]
  const [currencies, setCurrencies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchRates();
    fetchCurrencies();
  }, []);

  // API نه نرخونه راوړل
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

  // جدول ستونونه
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
      title: 'Exchange Rate',
      dataIndex: 'rate',
      key: 'rate',
    },
  ];

  // د نرخ نوي کولو لپاره مودال او فورم
  const showModal = () => setModalVisible(true);
  const handleCancel = () => {
    setModalVisible(false);
    form.resetFields();
  };

  const handleUpdateRate = async () => {
    try {
      const values = await form.validateFields();
      const httpReq = http();
      await httpReq.put('/api/exchange-rate/rates', values); // دا API باید ستا بیک‌اینډ کې جوړ وي
      message.success('Exchange rate updated!');
      handleCancel();
      fetchRates();
    } catch (error) {
      message.error('Failed to update rate');
    }
  };

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

          <Form.Item
            name="rate"
            label="Exchange Rate"
            rules={[
              { required: true, message: 'Please enter exchange rate' },
              { pattern: /^\d+(\.\d+)?$/, message: 'Please enter a valid number' },
            ]}
          >
            <InputNumber style={{ width: '100%' }} placeholder="e.g. 85" min={0} step={0.0001} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
    </Adminlayout>
  );
};

export default RatePage;
