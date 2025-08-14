import React, { useState } from 'react'
import { Button, Card, Empty, Form, Image, Input, message, Select } from "antd"
import { SearchOutlined } from "@ant-design/icons"
import { http, trimData } from "../../../modules/modules"

const { Option } = Select;

const NewTransaction = () => {
    const userInfo = JSON.parse(sessionStorage.getItem("userInfo"));
    const [transactionForm] = Form.useForm()
    const [messageApi, contextHolder] = message.useMessage();

    const [accountNo, setAccountNo] = useState(null);
    const [accountDetail, setAccountDetail] = useState(null);

    // Selected currency for transaction
    const [selectedCurrency, setSelectedCurrency] = useState(null);

    const onFinish = async (values) => {
        try {
            const finalObj = trimData(values);
            const httpReq = http();

            // Find the current balance for the selected currency
            const currentBalanceObj = accountDetail.balances?.find(
                (b) => b.currency === values.currency
            ) || { currency: values.currency, balance: 0 };

            let updatedBalance = Number(currentBalanceObj.balance) || 0;
            
            // Update balance based on transaction type
            if (values.transactionType === "cr") {
                updatedBalance += Number(values.transactionAmount);
            } else if (values.transactionType === "dr") {
                updatedBalance -= Number(values.transactionAmount);
            }

            // Prepare transaction data
            finalObj.currentBalance = updatedBalance;
            finalObj.customerId = accountDetail._id;
            finalObj.accountNo = accountDetail.accountNo;
            finalObj.branch = userInfo.branch;

            // Create transaction
            await httpReq.post("/api/transaction", finalObj);

            // Update customer's balances array
            const updatedBalances = accountDetail.balances?.length 
                ? accountDetail.balances.map(b => 
                    b.currency === values.currency 
                        ? { ...b, balance: updatedBalance } 
                        : b
                  )
                : [{ currency: values.currency, balance: updatedBalance }];

            // Update customer with new balances
            await httpReq.put(`/api/customers/${accountDetail._id}`, { 
                balances: updatedBalances 
            });

            messageApi.success("Transaction Created Successfully!")
            transactionForm.resetFields();
            setAccountDetail(null);
            setSelectedCurrency(null);
        } catch (error) {
            console.error("Transaction error:", error);
            messageApi.error("Unable to process Transaction!")
        }
    }

   const searchByAccountNo = async () => {
    try {
        let obj; // دلته obj یو ځل تعریف کوو چې دواړو بلاکونو کې وکارول شي

        if (userInfo.userType === "admin") {
            obj = { accountNo }; // اډمین لپاره یوازې accountNo
        } else {
            obj = {
                accountNo,
                branch: userInfo?.branch // کارکوونکي لپاره accountNo + branch
            };
        }

        const httpReq = http();
        const { data } = await httpReq.post(`/api/find-by-account`, obj);

        if (data?.data) {
            setAccountDetail(data.data);
            setSelectedCurrency(null); // که څو کرنسۍ وي نو کرنسۍ له سره ټاکو
        } else {
            messageApi.warning("There is no record of this account");
            setAccountDetail(null);
            setSelectedCurrency(null);
        }
    } catch (error) {
        messageApi.error("Unable to find account details");
    }
}


    return (
        <div>
            {contextHolder}
            <Card
                title="New Transaction"
                extra={
                    <Input
                        onChange={(e) => setAccountNo(e.target.value)}
                        placeholder='Enter Account Number'
                        addonAfter={<SearchOutlined onClick={searchByAccountNo} />}
                        style={{ cursor: "pointer" }}
                    />
                }
            >
                {
                    accountDetail ?
                        <div>
                            <div className='flex items-center justify-start gap-2'>
                                <Image width={120} className='rounded-full' src={`${import.meta.env.VITE_BASEURL}/${accountDetail?.profile}`} />
                                <Image width={120} className='rounded-full' src={`${import.meta.env.VITE_BASEURL}/${accountDetail?.signature}`} />
                            </div>
                            <div className='mt-5 grid md:grid-cols-3 gap-8'>
                                <div className='mt-3 flex flex-col gap-3'>
                                    <div className='flex justify-between items-center'>
                                        <b>Name : </b> <b>{accountDetail?.fullname}</b>
                                    </div>
                                    <div className='flex justify-between items-center'>
                                        <b>Mobile : </b> <b>{accountDetail?.mobile}</b>
                                    </div>
                                    <div className='flex justify-between items-center'>
                                        <b>Balance(s) : </b> 
                                        <div className="text-right">
                                            {accountDetail?.balances?.length > 0 ? (
                                                accountDetail.balances.map((balance) => {
                                                    if (!balance?.currency) return null;
                                                    
                                                    const currencySymbols = {
                                                        usd: '$',
                                                        inr: '₹',
                                                        eur: '€',
                                                        afn: '؋'
                                                    };
                                                    
                                                    const symbol = currencySymbols[balance.currency.toLowerCase()] || '';
                                                    const amount = Number(balance.balance || 0).toLocaleString(undefined, {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2
                                                    });
                                                    
                                                    return (
                                                        <div key={balance.currency} className="font-medium">
                                                            {balance.currency.toUpperCase()}: {symbol}{amount}
                                                        </div>
                                                    );
                                                })
                                            ) : (
                                                <span className="text-gray-400">No balances</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className='flex justify-between items-center'>
                                        <b>DOB : </b> <b>{accountDetail?.dob}</b>
                                    </div>
                                 
                                </div>
                                <div></div>
                                <Form
                                    form={transactionForm}
                                    onFinish={onFinish}
                                    layout='vertical'
                                >
                                    <div className='grid md:grid-cols-2 gap-x-3'>

                                        <Form.Item
                                            label="Transaction Type"
                                            rules={[{ required: true }]}
                                            name="transactionType"
                                        >
                                            <Select
                                                placeholder="Transaction Type"
                                                options={[
                                                    { value: "cr", label: "CR" },
                                                    { value: "dr", label: "DR" }
                                                ]}
                                            />
                                        </Form.Item>

                                        <Form.Item
                                            label="Currency"
                                            name="currency"
                                            rules={[{ required: true, message: 'Please select currency' }]}
                                        >
                                            <Select
                                                placeholder="Select Currency"
                                                onChange={(val) => setSelectedCurrency(val)}
                                            >
                                                {accountDetail?.balances?.map((balance) => (
                                                    <Option key={balance.currency} value={balance.currency}>
                                                        {balance.currency.toUpperCase()}
                                                    </Option>
                                                ))}
                                            </Select>
                                        </Form.Item>

                                       
                                    </div>

                                        <Form.Item
                                            label="Transaction Amount"
                                            rules={[{ required: true }]}
                                            name="transactionAmount"
                                        >
                                            <Input
                                                placeholder='500.00'
                                                type='number'
                                                min={0}
                                            />
                                        </Form.Item>

                                    <Form.Item
                                        label="Reference"
                                        name="refrence"
                                    >
                                        <Input.TextArea />
                                    </Form.Item>

                                    <Form.Item>
                                        <Button
                                            htmlType='submit'
                                            type='primary'
                                            className='w-full'
                                        >
                                            Submit
                                        </Button>
                                    </Form.Item>

                                </Form>
                            </div>
                        </div>
                        :
                        <Empty />
                }
            </Card>
        </div>
    )
}

export default NewTransaction
