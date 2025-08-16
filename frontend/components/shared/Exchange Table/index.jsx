import React, { useEffect, useState } from "react";
import { Table, Typography, Alert, Space, Tag, Card, Button } from "antd";
import { SwapOutlined } from '@ant-design/icons';
import { formatDate, http } from "../../../modules/modules";

const { Text } = Typography;

const CustomerExchangeTable = () => {
  console.log("CustomerExchangeTable component rendered");
  
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // Get user info from sessionStorage
  const userInfo = JSON.parse(sessionStorage.getItem("userInfo"));
  const customerId = userInfo?._id;
  
  console.log("User Info:", userInfo);
  console.log("Customer ID:", customerId);

  const fetchExchanges = async (page = 1, pageSize = 10) => {
    if (!customerId) {
      console.error("No customer ID found");
      return;
    }

    console.log(`Fetching exchanges for customer ${customerId}, page ${page}, pageSize ${pageSize}`);
    setLoading(true);
    
    try {
      const httpReq = http();
      // Try fetching by both customerId and accountNo
      const params = { 
        page, 
        pageSize,
        sort: '-createdAt',
        _t: Date.now()
      };
      
      // First try with customerId
      let url = `/api/exchange/historys/${customerId}`;
      let res = await httpReq.get(url, { params });
      
      // If no results, try with accountNo if available
      if ((!res.data.data || res.data.data.length === 0) && userInfo?.accountNo) {
        console.log("No results with customerId, trying with accountNo:", userInfo.accountNo);
        url = `/api/exchange/by-account/${userInfo.accountNo}`;
        res = await httpReq.get(url, { params });
      }
      
      console.log("API Response:", {
        status: res.status,
        url,
        data: res.data
      });
      
      if (!res.data) {
        console.error("No data in response");
        return;
      }
      
      const exchangeData = res.data.data || [];
      console.log("Exchange data to display:", exchangeData);
      
      setData(exchangeData);
      
      if (res.data.pagination) {
        const newPagination = {
          current: page,
          pageSize: pageSize,
          total: res.data.pagination.total || 0,
        };
        console.log("Updating pagination:", newPagination);
        setPagination(newPagination);
      }
    } catch (err) {
      console.error("Error in fetchExchanges:", {
        message: err.message,
        response: err.response?.data,
        stack: err.stack
      });
    } finally {
      console.log("Finished loading data");
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("Component mounted or customerId changed");
    fetchExchanges(pagination.current, pagination.pageSize);
  }, [customerId]);

  const handleTableChange = (pagination, filters, sorter) => {
    console.log("Table changed:", { pagination, filters, sorter });
    fetchExchanges(pagination.current, pagination.pageSize);
  };

  console.log("Rendering with data:", data);
  
  const columns = [
    { title: 'حساب شمیره', dataIndex: 'accountNo', key: 'accountNo' },
    { title: ' مشتری نوم', dataIndex: 'customerName', key: 'customerName' },
    { title: 'له کوم اسعار څخه  ', dataIndex: 'fromCurrency', key: 'fromCurrency' },
    { title: 'کوم اسعار ته', dataIndex: 'toCurrency', key: 'toCurrency' },
    { 
      title: 'اندازه', 
      dataIndex: 'amount', 
      key: 'amount',
      render: amount => Math.round(amount)
    },
    { 
      title: ' تبادلې نرخ', 
      dataIndex: 'rate', 
      key: 'rate',
      render: rate => Math.round(rate * 1000) / 1000 // Show up to 3 decimal places for rate
    },
    { 
      title: ' تبادلې شوی اندازه', 
      dataIndex: 'convertedAmount', 
      key: 'convertedAmount',
      render: amount => amount ? Math.round(amount) : ''
    },
    { title: 'نېټه', dataIndex: 'date', key: 'date' },
    { title: 'Created By', dataIndex: 'createdBy', key: 'createdBy' },
  ];

  if (!customerId) {
    console.warn("No customer ID found, showing login prompt");
    return (
      <Alert 
        message="Authentication Required" 
        description="Please log in to view your exchange history." 
        type="warning" 
        showIcon 
        style={{ margin: '20px' }}
      />
    );
  }

  return (
    <div className="p-4">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Exchange History</h2>
        <Text type="secondary">View your currency exchange transactions</Text>
      </div>
      
      <Table
        rowKey="_id"
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} transactions`,
          pageSizeOptions: ['10', '20', '50', '100'],
          showQuickJumper: true,
          size: 'default'
        }}
        onChange={handleTableChange}
        scroll={{ x: 'max-content' }}
        locale={{
          emptyText: (
            <div className="py-12 text-center">
              <div className="text-gray-400 text-lg mb-2">No exchange history found</div>
              <div className="text-gray-400">Your exchange transactions will appear here</div>
            </div>
          )
        }}
        className="shadow-sm rounded-lg overflow-hidden"
      />
    </div>
  );
};

const ExchangeTable = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const userInfo = JSON.parse(sessionStorage.getItem("userInfo"));
  const customerId = userInfo?._id;
  const accountNo = userInfo?.accountNo;

  const fetchExchanges = async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const httpReq = http();
      
      // First try with customer ID
      let res = await httpReq.get(`/api/exchange/historys/${customerId}`, {
        params: { page, pageSize, sort: '-createdAt' }
      });

      // If no results, try with account number
      if ((!res.data?.data?.length || res.data.data.length === 0) && accountNo) {
        res = await httpReq.get(`/api/exchange/by-account/${accountNo}`, {
          params: { page, pageSize, sort: '-createdAt' }
        });
      }

      if (res.data?.data) {
        setData(res.data.data);
        setPagination(prev => ({
          ...prev,
          current: page,
          pageSize,
          total: res.data.pagination?.total || 0,
        }));
      }
    } catch (error) {
      console.error("Error fetching exchange history:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (customerId || accountNo) {
      fetchExchanges(pagination.current, pagination.pageSize);
    }
  }, [customerId, accountNo]);

  const handleTableChange = (pagination) => {
    fetchExchanges(pagination.current, pagination.pageSize);
  };

  const columns = [
    { 
      title: 'Account No', 
      dataIndex: 'accountNo', 
      key: 'accountNo',
      render: (accountNo) => accountNo || 'N/A'
    },
    { 
      title: 'Customer Name', 
      dataIndex: 'customerName', 
      key: 'customerName',
      render: (name) => name || 'N/A'
    },
    { 
      title: 'From', 
      dataIndex: 'fromCurrency', 
      key: 'fromCurrency',
      render: (currency) => <Tag color="blue">{currency}</Tag>
    },
    { 
      title: 'To', 
      dataIndex: 'toCurrency', 
      key: 'toCurrency',
      render: (currency) => <Tag color="green">{currency}</Tag>
    },
    { 
      title: 'Amount', 
      dataIndex: 'amount', 
      key: 'amount',
      render: (amount) => amount ? Math.round(amount) : 'N/A'
    },
    { 
      title: 'Rate', 
      dataIndex: 'rate', 
      key: 'rate',
      render: (rate) => rate ? (Math.round(rate * 1000) / 1000).toFixed(3) : 'N/A'
    },
    { 
      title: 'Converted Amount', 
      dataIndex: 'convertedAmount', 
      key: 'convertedAmount',
      render: (amount) => amount ? Math.round(amount) : 'N/A'
    },
    { 
      title: 'Date', 
      dataIndex: 'createdAt', 
      key: 'date',
      render: (date) => new Date(date).toLocaleDateString()
    },
    { 
      title: 'Processed By', 
      dataIndex: 'createdBy', 
      key: 'createdBy',
      render: (createdBy) => <Tag color="purple">{createdBy || 'System'}</Tag>
    },
  ];

  return (
    <Card 
      title={
        <Space>
          <SwapOutlined />
          <span>Exchange History</span>
        </Space>
      }
      style={{ margin: '20px' }}
      extra={
        <Button 
          type="primary" 
          icon={<SwapOutlined />}
          onClick={() => fetchExchanges(pagination.current, pagination.pageSize)}
          loading={loading}
        >
          Refresh
        </Button>
      }
    >
      <Table
        columns={columns}
        dataSource={data}
        rowKey="_id"
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} exchanges`,
          pageSizeOptions: ['10', '20', '50', '100'],
          showQuickJumper: true,
        }}
        loading={loading}
        onChange={handleTableChange}
        scroll={{ x: 'max-content' }}
        locale={{
          emptyText: (
            <div style={{ padding: '40px 0', textAlign: 'center' }}>
              <Text type="secondary">No exchange history found</Text>
            </div>
          )
        }}
      />
    </Card>
  );
};

export default CustomerExchangeTable;
