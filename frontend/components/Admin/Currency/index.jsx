import React, { useEffect, useState } from 'react'
import Adminlayout from '../../layout/Adminlayout';
import { Button, Card, Form, Image, Input, message, Popconfirm, Table } from 'antd';
import { DeleteOutlined, EditOutlined, EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';
import { trimData, http } from '../../../modules/modules';

import swal from 'sweetalert';
const { Item } = Form


const Currency = () => {
    //state collection
    const [currencyForm] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [photo, setPhoto] = useState(null);
    const [allCurrency, setAllCurrency] = useState([]);
    const [edit, setEdit] = useState(null);
    const [no, setNo] = useState(0);
    const [messageApi, context] = message.useMessage();


    //get all employees

    useEffect(() => {
        const fetcher = async () => {
            try {
                const httpReq = http();
                const { data } = await httpReq.get("/api/currency");
                setAllCurrency(data.data);
            } catch (err) {
                messageApi.error("Unable to fetch data !");
            }
        }
        fetcher();


    }, [no])

    //create a new currency

    const onFinish = async (values) => {
        try {
            setLoading(true);
            const finalObj = trimData(values)
            finalObj.key = finalObj.currencyName
            const httpReq = http();
            const { data } = await httpReq.post(`/api/currency`, finalObj)
            messageApi.success("currency is created Successfully ");
            currencyForm.resetFields();
           
            setNo(no + 1)
        } catch (err) {
            if (err?.response?.status === 409) {
                currencyForm.setFields([
                    {
                        name: 'currencyName',
                        errors: ["currency already exist !"],
                    }
                ])

            } else {
                messageApi.error("please try again !");
            }

        } finally {
            setLoading(false);
        }

    }


   

    //update employee
    const onEditCurrency = async (obj) => {
        setEdit(obj)
        currencyForm.setFieldsValue(obj)
    }


    const onUpdate = async (values) => {
        try {
            setLoading(true)
            let finalObj = trimData(values)
            
            const httpReq = http();
            await httpReq.put(`/api/currency/${edit._id}`, finalObj);
            messageApi.success("currency is Update Successfully!")
            setNo(no + 1)
            setEdit(null);
            currencyForm.resetFields()



        } catch (err) {
            messageApi.error("Unable to update currency !")

        } finally {
            setLoading(false)
        }


    }

    //delete employee
    const onDeleteCurrency = async (id) => {
        try {
            const httpReq = http();
            await httpReq.delete(`/api/currency/${id}`)
            messageApi.success("currency Is Deleted Successfully !");
            setNo(no + 1)
        } catch (err) {
            messageApi.error("Unable To Delete The currency !");

        }
    }







    //columns for the table
    const columns = [

        {
            title: "Currency Name",
            dataIndex: "currencyName",
            key: "currencyName",
        },
       
        {
            title: "currency Description",
            dataIndex: "currencyDesc",
            key: "currencyDesc",

        },
        {
            title: "Action",
            key: "action",
            fixed: "right",
            render: (_, obj) => (
                <div className="flex gap-1  ">


                    <Popconfirm title="Are You Sure !"
                        description="Once you update,you can also re-update !"
                        onCancel={() => messageApi.info("No Changes occur !")}
                        onConfirm={() => onEditCurrency(obj)}

                    >

                        <Button type='text' className='!bg-green-100 !text-green-500' icon={<EditOutlined />}></Button>

                    </Popconfirm>


                    <Popconfirm
                        title="Are You Sure ?"
                        description="Once You Deleted, you can not re-store !"
                        onCancel={() => messageApi.info("Your data is safe !")}
                        onConfirm={() => onDeleteCurrency(obj._id)}

                    >

                        <Button type='text' className='!bg-rose-100 !text-rose-500' icon={<DeleteOutlined />}></Button>
                    </Popconfirm>

                </div>
            )

        },
    ]
    return (
        <Adminlayout>
            {context}
            <div className='grid md:grid-cols-3 gap-3'>
                <Card
                    title="Add New Currency"
                >
                    <Form layout='vertical' form={currencyForm} onFinish={edit ? onUpdate : onFinish} >
                        <Item name="currencyName" label="currency Name ">
                            <Input />
                        </Item>
                        <Item
                            label="currency Description"
                            name="currencyDesc"
                            rules={[{ required: true }]}

                        >
                            <Input.TextArea />
                        </Item>
                        <Item>
                            {
                                edit
                                    ?
                                    <Button
                                        type='text'
                                        htmlType='submit'
                                        className='!bg-rose-500 !text-white !font-bold !w-full'
                                        loading={loading}
                                    >
                                        Update
                                    </Button>
                                    :
                                    <Button
                                        type='text'
                                        htmlType='submit'
                                        className='!bg-blue-500 !text-white !font-bold !w-full'
                                        loading={loading}
                                    >
                                        Submit
                                    </Button>
                            }
                        </Item>

                    </Form>


                </Card>
                <Card
                    className='md:col-span-2'
                    title="Currency list"
                    style={{ overflowX: "auto" }}
                >
                    <Table columns={columns} dataSource={allCurrency} scroll={{ x: "max-content" }} />
                </Card>

            </div>
        </Adminlayout>
    )
}


export default Currency;


