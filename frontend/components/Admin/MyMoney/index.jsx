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
import AdminLayout from "../../Layout/Adminlayout";
const { Option } = Select;

const Index = () => {
  const [form] = Form.useForm();
  const [selectedCurrencies, setSelectedCurrencies] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [amounts, setAmounts] = useState({});
  const [personName, setpersonName] = useState("");
  const [records, setRecords] = useState([]);
  const [allCurrencies, setAllCurrencies] = useState([]); // all currencies found in records

  const httpReq = http();

  const fetchRecords = async () => {
    try {
      const res = await httpReq.get("/api/cash-summary");
      if (res.data.success) {
        setRecords(res.data.data);
      } else {
        message.error("د معلوماتو په اخیستلو کې ستونزه");
      }
    } catch (error) {
      message.error("د معلوماتو په اخیستلو کې ستونزه");
    }
  };

  const fetchCurrencies = async () => {
    try {
      const { data } = await httpReq.get("/api/currency");
      if (data && data.data) {
        // Transform the API response to include both code and symbol
        const currencies = data.data.map((currency) => ({
          code: currency.currencyName, // e.g., "$"
          symbol: currency.currencyDesc, // e.g., "usd"
          display: `${currency.currencyName} (${currency.currencyDesc.toUpperCase()})`, // e.g., "$ (USD)"
        }));
        setAllCurrencies(currencies);
      }
    } catch (err) {
      console.error("Error fetching currencies:", err);
      message.error("د اسعارو په اخیستلو کې ستونزه");
    }
  };

  useEffect(() => {
    fetchRecords();
    fetchCurrencies();
  }, []);

  const onCurrencyChange = (values) => {
    setSelectedCurrencies(values);
    if (values.length > 0) setModalVisible(true);
    else setModalVisible(false);
  };

  const handleAmountChange = (currency, value) => {
    setAmounts((prev) => ({ ...prev, [currency]: value }));
  };

  const handlepersonNameChange = (e) => {
    setpersonName(e.target.value);
  };

  const handleSubmit = async () => {
    if (!personName) {
      message.error("لطفاً د شخص نوم ولیکئ");
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
      location: "store",
      personName,
    }));

    try {
      const res = await httpReq.post("/api/cash-summary/bulk", { data: payload });
      if (res.data.success) {
        message.success("په کامیابۍ ثبت شو");
        form.resetFields();
        setSelectedCurrencies([]);
        setAmounts({});
        setpersonName("");
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
    const key = `${item.personName}-${item.location}`;
    if (!groupedData[key]) {
      groupedData[key] = {
        key,
        personName: item.personName,
        location: item.location,
      };
    }
    groupedData[key][item.currency] = item.amount;
  });

  const dataSource = Object.values(groupedData);

  // 🟢 Dynamic columns
  const columns = [
    {
      title: "شخص نوم",
      dataIndex: "personName",
      key: "personName",
    },
    ...allCurrencies.map((cur) => ({
      title: cur.display,
      dataIndex: cur.code,
      key: cur.code,
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
            setpersonName("");
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
                value={personName}
                onChange={handlepersonNameChange}
              />
            </Form.Item>

            <Form.Item label="اسعار انتخاب کړئ" required>
              <Select
                mode="multiple"
                style={{ width: "100%" }}
                placeholder="اسعار انتخاب کړئ"
                onChange={onCurrencyChange}
                value={selectedCurrencies}
                optionLabelProp="display"
              >
                {allCurrencies.map((currency, index) => (
                  <Option
                    key={`${currency.code}-${index}`}
                    value={currency.code}
                    display={currency.display}
                  >
                    {currency.display}
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
