import React, { useState, useEffect } from "react";
import {
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Table,
  message,
} from "antd";
import { http } from "../../../modules/modules";
import AdminLayout from "../../Layout/AdminLayout";
const { Option } = Select;

const Index = () => {
  const [form] = Form.useForm();
  const [selectedCurrencies, setSelectedCurrencies] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [amounts, setAmounts] = useState({});
  const [bankName, setBankName] = useState("");
  const [records, setRecords] = useState([]);
  const [allCurrencies, setAllCurrencies] = useState(["USD", "AFN", "EUR"]); // all currencies found in records

  const httpReq = http();

  const fetchRecords = async () => {
    try {
      const res = await httpReq.get("/api/cash-summary");
      if (res.data.success) {
        setRecords(res.data.data);

        // Find all unique currencies dynamically
        const currenciesSet = new Set();
        res.data.data.forEach((item) => currenciesSet.add(item.currency));
        setAllCurrencies(Array.from(currenciesSet));
      } else {
        message.error("د معلوماتو په اخیستلو کې ستونزه");
      }
    } catch (error) {
      message.error("د معلوماتو په اخیستلو کې ستونزه");
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const onCurrencyChange = (values) => {
    setSelectedCurrencies(values);
    if (values.length > 0) setModalVisible(true);
    else setModalVisible(false);
  };

  const handleAmountChange = (currency, value) => {
    setAmounts((prev) => ({ ...prev, [currency]: value }));
  };

  const handleBankNameChange = (e) => {
    setBankName(e.target.value);
  };

  const handleSubmit = async () => {
    if (!bankName) {
      message.error("لطفاً د بانک نوم ولیکئ");
      return;
    }
    if (selectedCurrencies.length === 0) {
      message.error("لطفاً لږ تر لږه یو اسعار انتخاب کړئ");
      return;
    }
    for (const cur of selectedCurrencies) {
      if (!amounts[cur] || amounts[cur] <= 0) {
        message.error(`مهرباني وکړئ د ${cur} مقدار ولیکئ`);
        return;
      }
    }

    const payload = selectedCurrencies.map((cur) => ({
      currency: cur,
      amount: amounts[cur],
      location: "bank",
      bankName,
    }));

    try {
      const res = await httpReq.post("/api/cash-summary/bulk", { data: payload });
      if (res.data.success) {
        message.success("په کامیابۍ ثبت شو");
        form.resetFields();
        setSelectedCurrencies([]);
        setAmounts({});
        setBankName("");
        setModalVisible(false);
        fetchRecords();
      } else {
        message.error("ثبت کې ستونزه ده");
      }
    } catch (error) {
      message.error("ثبت کې ستونزه ده");
    }
  };

  // 🟡 Group records by bank and location
  const groupedData = {};
  records.forEach((item) => {
    const key = `${item.bankName}-${item.location}`;
    if (!groupedData[key]) {
      groupedData[key] = {
        key,
        bankName: item.bankName,
        location: item.location,
      };
    }
    groupedData[key][item.currency] = item.amount;
  });

  const dataSource = Object.values(groupedData);

  // 🟢 Dynamic columns
  const columns = [
    {
      title: "ځای نوم",
      dataIndex: "bankName",
      key: "bankName",
    },
   
    ...allCurrencies.map((cur) => ({
      title: cur,
      dataIndex: cur,
      key: cur,
      render: (val) => val || "-", // Show "-" if no value
    })),
  ];

  return (
    <AdminLayout>
      <Card title="په بانک کې د څو اسعارو ثبت او کتنه">
        <Button
          type="primary"
          onClick={() => {
            setModalVisible(true);
            form.resetFields();
            setSelectedCurrencies([]);
            setAmounts({});
            setBankName("");
          }}
          style={{ marginBottom: 16 }}
        >
          د پیسو ثبتولو لپاره کلیک وکړئ
        </Button>

        <Modal
          title="د بانک پیسې ثبت کړئ"
          open={modalVisible}
          onOk={handleSubmit}
          onCancel={() => setModalVisible(false)}
          okText="ثبت"
          cancelText="لغوه"
          maskClosable={false}
        >
          <Form layout="vertical" form={form}>
            <Form.Item label="ځای نوم" required>
              <Input
                placeholder="لکه Azizi Bank"
                value={bankName}
                onChange={handleBankNameChange}
              />
            </Form.Item>

            <Form.Item label="اسعار انتخاب کړئ" required>
              <Select
                mode="multiple"
                placeholder="څو اسعار انتخاب کړئ"
                onChange={onCurrencyChange}
                value={selectedCurrencies}
              >
                {allCurrencies.map((cur) => (
                  <Option key={cur} value={cur}>
                    {cur}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            {selectedCurrencies.map((cur) => (
              <Form.Item key={cur} label={`${cur} مقدار`} required>
                <InputNumber
                  style={{ width: "100%" }}
                  min={1}
                  value={amounts[cur]}
                  onChange={(value) => handleAmountChange(cur, value)}
                  placeholder={`${cur} مقدار ولیکئ`}
                />
              </Form.Item>
            ))}
          </Form>
        </Modal>

        <Table
          columns={columns}
          dataSource={dataSource}
          pagination={{ pageSize: 7 }}
        />
      </Card>
    </AdminLayout>
  );
};

export default Index;
