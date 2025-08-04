import React, { useEffect, useState } from 'react'
import Adminlayout from '../../layout/Adminlayout';
import { Button, Card, Form, Image, Input, message, Popconfirm, Table } from 'antd';
import { DeleteOutlined, EditOutlined, EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';
import { trimData, http } from '../../../modules/modules';

import swal from 'sweetalert';
const { Item } = Form


const Branch = () => {
    //state collection
    const [branchform] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [photo, setPhoto] = useState(null);
    const [allBranch, setAllBranch] = useState([]);
    const [edit, setEdit] = useState(null);
    const [no, setNo] = useState(0);
    const [messageApi, context] = message.useMessage();


    //get all employees

    useEffect(() => {
        const fetcher = async () => {
            try {
                const httpReq = http();
                const { data } = await httpReq.get("/api/branch");
                setAllBranch(data.data);
            } catch (err) {
                messageApi.error("Unable to fetch data !");
            }
        }
        fetcher();


    }, [no])

    //create a new employee

    const onFinish = async (values) => {
        try {
            setLoading(true);
            const finalObj = trimData(values)
            finalObj.key = finalObj.branchName
            const httpReq = http();
            const { data } = await httpReq.post(`/api/branch`, finalObj)
            messageApi.success("Branch is created Successfully ");
            branchform.resetFields();
           
            setNo(no + 1)
        } catch (err) {
            if (err?.response?.status === 409) {
                branchform.setFields([
                    {
                        name: 'branchName',
                        errors: ["Branch already exist !"],
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
    const onEditBranch = async (obj) => {
        setEdit(obj)
        branchform.setFieldsValue(obj)
    }


    const onUpdate = async (values) => {
        try {
            setLoading(true)
            let finalObj = trimData(values)
            
            const httpReq = http();
            await httpReq.put(`/api/branch/${edit._id}`, finalObj);
            messageApi.success("Branch is Update Successfully!")
            setNo(no + 1)
            setEdit(null);
            branchform.resetFields()



        } catch (err) {
            messageApi.error("Unable to update branch !")

        } finally {
            setLoading(false)
        }


    }

    //delete employee
    const onDeleteBranch = async (id) => {
        try {
            const httpReq = http();
            await httpReq.delete(`/api/branch/${id}`)
            messageApi.success("Branch Is Deleted Successfully !");
            setNo(no + 1)
        } catch (err) {
            messageApi.error("Unable To Delete The branch !");

        }
    }







    //columns for the table
    const columns = [

        {
            title: "Branch Name",
            dataIndex: "branchName",
            key: "branchName",
        },
        {
            title: "Branch Address",
            dataIndex: "branchAddress",
            key: "branchAddress",

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
                        onConfirm={() => onEditBranch(obj)}

                    >

                        <Button type='text' className='!bg-green-100 !text-green-500' icon={<EditOutlined />}></Button>

                    </Popconfirm>


                    <Popconfirm
                        title="Are You Sure ?"
                        description="Once You Deleted, you can not re-store !"
                        onCancel={() => messageApi.info("Your data is safe !")}
                        onConfirm={() => onDeleteBranch(obj._id)}

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
                    title="Add New Branch"
                >
                    <Form layout='vertical' form={branchform} onFinish={edit ? onUpdate : onFinish} >
                        <Item name="branchName" label="Branch Name ">
                            <Input />
                        </Item>
                        <Item
                            label="Branch Address"
                            name="branchAddress"
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
                    title="Branch list"
                    style={{ overflowX: "auto" }}
                >
                    <Table columns={columns} dataSource={allBranch} scroll={{ x: "max-content" }} />
                </Card>

            </div>
        </Adminlayout>
    )
}


export default Branch;


