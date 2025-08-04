import React, { useState } from 'react'
import { Button, Card, Empty, Form, Image, Input, message, Select } from "antd"
import { SearchOutlined } from "@ant-design/icons"
import {http, trimData} from "../../../modules/modules"
const NewTransaction = () => {
    //get user Info from session stroage
    const userInfo = JSON.parse(sessionStorage.getItem("userInfo"));

    //from Info
    const [transactionForm] = Form.useForm()
    const [messageApi, contextHolder] = message.useMessage();

    //state collection
    const [accountNo, setAccountNo] = useState(null);
    const [accountDetail, setAccountDetail] = useState(null);


    const onFinish = async (values) => {
        try {
            const finalObj = trimData(values);
            let balance = 0
            if(finalObj.transactionType === "cr"){
                balance = Number(accountDetail.finalBalance) + Number(finalObj.transactionAmount)
            }
            else if(finalObj.transactionType === "dr"){
                balance = Number(accountDetail.finalBalance) - Number(finalObj.transactionAmount)
            }

           finalObj.currentBalance = accountDetail.finalBalance;
           finalObj.customerId = accountDetail._id;
           finalObj.accountNo = accountDetail.accountNo;
           finalObj.branch = userInfo.branch;
           const httpReq = http();
            await httpReq.post("/api/transaction",finalObj)
            await httpReq.put(`/api/customers/${accountDetail._id}`,{finalBalance:balance})
            messageApi.success("Transaction Created Successfully !")
            transactionForm.resetFields();
            setAccountDetail(null)

            
        } catch (error) {
            messageApi.error("Unable to process Transaction !")
            
        }
    }

    const searchByAccountNo = async () =>{
        try {
            const obj = {
                accountNo,
                branch : userInfo?.branch
            }
            const httpReq = http();
            const {data} = await httpReq.post(`/api/find-by-account`,obj);
            if (data?.data){
                setAccountDetail(data?.data)
            } else{
                messageApi.warning("There is no record of this account");
                setAccountDetail(null)
            }
            
        } catch (error) {
            messageApi.error("unable to find account details")
        }
    }
    return (
        <div>
            {contextHolder}
            <Card
                title="New Transaction"
                extra={
                    <Input
                        onChange={(e)=> setAccountNo(e.target.value)}
                        placeholder='Enter Account Number'
                        addonAfter={<SearchOutlined  />}
                        onClick={searchByAccountNo}
                        style={{ cursor: "pointer" }} />
                       
                }

            >


                {
                    accountDetail ?
                        <div>
                            <div>
                                <div className='flex items-center justify-start gap-2'>
                                    <Image width={120} className='rounded-full' src={`${import.meta.env.VITE_BASEURL}/${accountDetail?.profile }`}></Image>
                                    <Image width={120} className='rounded-full' src={`${import.meta.env.VITE_BASEURL}/${accountDetail?.signature }`}></Image>
                                </div>
                            </div>
                            <div className='mt-5 grid md:grid-cols-3 gap-8'>
                                <div className='mt-3 flex flex-col gap-3'>
                                    <div className='flex justify-between items-center'>
                                        <b>Name : </b> <b>{accountDetail?.fullname }</b>

                                    </div>

                                    <div className='flex justify-between items-center'>
                                        <b>Mobile : </b> <b>{accountDetail?.mobile }</b>

                                    </div>
                                    <div className='flex justify-between items-center'>
                                        <b>Balance : </b> <b>{accountDetail?.currency === "inr" ? "₹" : "$"} {accountDetail?.finalBalance}</b>

                                    </div>
                                    <div className='flex justify-between items-center'>
                                        <b>DOB : </b> <b>{accountDetail?.dob }</b>

                                    </div>
                                    <div className='flex justify-between items-center'>
                                        <b>Currency : </b> <b>{accountDetail?.currency }</b>

                                    </div>


                                </div>
                                <div></div>
                                <Form
                                    form={transactionForm}
                                    onFinish={onFinish}
                                    layout='vertical'
        c
                                >
                                    <div className='grid md:grid-cols-2 gap-x-3'>
                                        <Form.Item
                                            label="Tranasaction Type"
                                            rules={[{ required: true }]}
                                            name="transactionType"
                                        >
                                            <Select
                                                placeholder="Transaction Type"
                                                className='w-full'
                                                options={[
                                                    { value: "cr", label: "CR" },
                                                    { value: "dr", label: "DR" }
                                                ]}
                                            >

                                            </Select>

                                        </Form.Item>

                                        <Form.Item
                                            label="Transaction Amount"
                                            rules={[{ required: true }]}
                                            name="transactionAmount"
                                        >

                                            <Input
                                                placeholder='500.00'
                                                type='Number'

                                            />

                                        </Form.Item>

                                    </div>
                                    <Form.Item
                                        label="Refrence"
                                        name="refrence"
                                    >
                                        <Input.TextArea />

                                    </Form.Item>

                                    <Form.Item  >
                                        <Button
                                            htmlType='submit'
                                            type='text'
                                            className='!bg-blue-500 !text-white !font-semibold !w-full'
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