import React, { useEffect, useState } from 'react'
import { Button, Card, DatePicker, Form, Image, Input, message, Modal, Popconfirm, Select, Table } from 'antd'
import { DeleteOutlined, DownloadOutlined, EditOutlined, EyeInvisibleOutlined, EyeOutlined, SearchOutlined } from '@ant-design/icons'
import { http, uploadFile, fetchData, trimData } from '../../../modules/modules'
import useSWR, { mutate } from 'swr'
const { Item } = Form
const { Option } = Select

const NewAccount = () => {
    //get userInfo from the session stroage
    const userInfo = JSON.parse(sessionStorage.getItem("userInfo"))
    const [accountForm] = Form.useForm();
    const [accountModal, setAccountModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [photo, setPhoto] = useState(null);
    const [signature, setsignature] = useState(null);
    const [document, setDocument] = useState(null);
    const [no, setNo] = useState(0);
    const [messageApi, context] = message.useMessage();
    const [allCustomer, setAllCustomer] = useState(null)
    const [finalCustomer, setFinalCustomer] = useState(null)
    const [edit, setEdit] = useState(null);




    //get branding details
    const { data: brandings, error: bError } = useSWR(
        "/api/branding",
        fetchData,
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
            refreshInterval: 1200000,
        }
    )

    let bankAccountNo = Number(brandings && brandings?.data[0]?.bankAccountNo) + 1
    let brandingId = brandings && brandings?.data[0]?._id;

    accountForm.setFieldValue("accountNo", bankAccountNo);

    // get customer data
    useEffect(() => {
        const fetcher = async () => {
            try {
                const httpReq = http();
                const { data } = await httpReq.get("/api/customers");
                setAllCustomer(data?.data?.filter((item)=>item.branch == userInfo.branch));
                setFinalCustomer(data?.data?.filter((item)=>item.branch == userInfo.branch));
            } catch (err) {
                messageApi.error("Unable to fetch data !");
            }
        }
        fetcher();


    }, [no])








    //create new account 
    const onFinish = async (values) => {
        try {
            setLoading(true);
            const finalObj = trimData(values)
            finalObj.profile = photo ? photo : "bankImages/dummy.png";
            finalObj.signature = signature ? signature : "bankImages/signature.png";
            finalObj.document = document ? document : "bankImages/bank.jfif";
            finalObj.key = finalObj.email
            finalObj.userType = "customer"
            finalObj.branch = userInfo?.branch;
            finalObj.createdBy = userInfo?.email;
            const httpReq = http();
            console.log(httpReq)
            const { data } = await httpReq.post(`/api/users`, finalObj)
            finalObj.customerLoginId = data?.data?._id

            const obj = {
                email: finalObj.email,
                password: finalObj.password
            }
            await httpReq.post(`/api/customers`, finalObj)
            await httpReq.post(`/api/send-email`, obj)
            await httpReq.put(`/api/branding/${brandingId}`, { bankAccountNo })


            accountForm.resetFields();
            mutate("/api/branding")
            setPhoto(null);
            setsignature(null);
            setDocument(null);
            setNo(no + 1)
            setAccountModal(false)
            messageApi.success("Account created ");
        } catch (err) {
            if (err?.response?.status === 409) {
                accountForm.setFields([
                    {
                        name: 'email',
                        errors: ["Email already exist !"],
                    }
                ])

            } else {
                messageApi.error("please try again !");
            }

        } finally {
            setLoading(false);
        }

    }
    //handle photo
    const handlePhoto = async (e) => {
        const file = e.target.files[0];
        const folderName = "customerPhoto"
        try {
            const result = await uploadFile(file, folderName);
            setPhoto(result.filePath)
        } catch (err) {
            messageApi.error("Unable to upload !");

        }

    }
    //handle signature
    const handleSignature = async (e) => {
        const file = e.target.files[0];
        const folderName = "customerSignature"
        try {
            const result = await uploadFile(file, folderName);
            setsignature(result.filePath)
        } catch (err) {
            messageApi.error("Unable to upload !");

        }

    }
    //handle document
    const handleDocument = async (e) => {
        const file = e.target.files[0];
        const folderName = "customerDocument"
        try {
            const result = await uploadFile(file, folderName);
            setDocument(result.filePath)
        } catch (err) {
            messageApi.error("Unable to upload !");

        }

    }


    //update is active
    const updateIsActive = async (id, isActive, loginId) => {
        try {
            const obj = {
                isActive: !isActive
            }
            const httpReq = http();
            await httpReq.put(`/api/users/${loginId}`, obj);
            await httpReq.put(`/api/customers/${id}`, obj);
            messageApi.success("Record updated successfully !")
            setNo(no + 1)

        } catch (err) {
            messageApi.error("Unable to update isActive !")

        }

    }

    // searching coding 
    const onSearch = (e) => {
        const value = e.target.value.trim().toLowerCase();
        const filter = finalCustomer && finalCustomer.filter(cust => {
            if (cust?.fullname.toLowerCase().indexOf(value) != -1) {
                return cust
            }
            else if (cust?.userType.toLowerCase().indexOf(value) != -1) {
                return cust
            }
            else if (cust?.email.toLowerCase().indexOf(value) != -1) {
                return cust
            }
            else if (cust?.address.toLowerCase().indexOf(value) != -1) {
                return cust
            }
            else if (cust?.accountNo.toString().indexOf(value) != -1) {
                return cust
            }
            else if (cust?.createdBy.toString().indexOf(value) != -1) {
                return cust
            }
            else if (cust?.finalBalance.toString().indexOf(value) != -1) {
                return cust
            }
            else if (cust?.branch.toLowerCase().indexOf(value) != -1) {
                return cust
            }
            else if (cust?.mobile.toString().indexOf(value) != -1) {
                return cust
            }

        })
        setAllCustomer(filter)
    }


    //update employee
    const onEditUser = async (obj) => {
        setEdit(obj)
        setAccountModal(true)
        accountForm.setFieldsValue(obj)
    }


    const onUpdate = async (values) => {
        try {
            setLoading(true)
            let finalObj = trimData(values);
            delete finalObj.password
            delete finalObj.email
            delete finalObj.accountNo
            if (photo) {
                finalObj.profile = photo
            }
            if (signature) {
                finalObj.signature = signature
            }
            if (document) {
                finalObj.document = document
            }
            const httpReq = http();
            await httpReq.put(`/api/customers/${edit._id}`, finalObj);
            messageApi.success("Customer Update Successfully!")

            setNo(no + 1)
            setEdit(null);
            setPhoto(null);
            setsignature(null);
            setDocument(null);
            accountForm.resetFields()
            setAccountModal(false)


        } catch (err) {
            messageApi.error("Unable to update Customer !")

        } finally {
            setLoading(false)
        }


    }

    //delete employee
    const onDeleteUser = async (id, loginId) => {
        try {
            const httpReq = http();
            await httpReq.delete(`/api/users/${loginId}`)
            await httpReq.delete(`/api/customers/${id}`)

            messageApi.success("Customer Is Deleted Successfully !");
            setNo(no + 1)
        } catch (err) {
            messageApi.error("Unable To Delete The Customer !");

        }
    }





    const columns = [
        {
            title: "Photo",
            key: "photo",
            render: (src, obj) => (
                <Image src={`${import.meta.env.VITE_BASEURL}/${obj?.profile}`} className="rounded-full" width={40} height={40} />
            )
        },

        {
            title: "Signature",
            key: "signature",
            render: (src, obj) => (
                <Image src={`${import.meta.env.VITE_BASEURL}/${obj?.signature}`} className="rounded-full" width={40} height={40} />
            )
        },
        {
            title: "Document",
            key: "document",
            render: (src, obj) => (
                <Button type='text' shape='cricle' className='!bg-blue-100 !text-blue-500' icon={<DownloadOutlined />}></Button>
            )
        },
        {
            title: "Created By",
            dataIndex: "createdBy",
            key: "createdBy",
        },
        {
            title: "Address",
            dataIndex: "address",
            key: "address",
        },
        {
            title: "Branch",
            dataIndex: "branch",
            key: "branch",
        },
        {
            title: "User Type",
            dataIndex: "userType",
            key: "userType",
            render: (text) => {
                if (text === "admin") {
                    return <span className=' capitalize text-indigo-500'>{text}</span>
                } else if (text === "employee") {
                    return <span className=' capitalize text-green-500'>{text}</span>
                } else {
                    return <span className=' capitalize text-red-500'>{text}</span>
                }
            }
        },
        {
            title: "Account No",
            dataIndex: "accountNo",
            key: "accountNo",
        },
        {
            title: "Balance",
            dataIndex: "finalBalance",
            key: "Balance",
        },
        {
            title: "Fullname",
            dataIndex: "fullname",
            key: "fullname",
        },
        {
            title: "DOB",
            dataIndex: "dob",
            key: "dob",
        },
        {
            title: "Email",
            dataIndex: "email",
            key: "email",
        },
        {
            title: "Mobile",
            dataIndex: "mobile",
            key: "mobile",
        },

        {
            title: "Action",
            key: "action",
            fixed: "right",
            render: (_, obj) => (
                <div className="flex gap-1">
                    <Popconfirm
                        title="Are you sure ?"
                        description="Once you update, you can also re-update !"
                        onCancel={() => messageApi.info("No changes occur !")}
                        onConfirm={() => updateIsActive(obj._id, obj.isActive, obj.customerLoginId)}
                    >

                        <Button type='text' className={`${obj.isActive ? "!bg-indigo-100 !text-indigo-500" : "!bg-pink-100 !text-pink-500"}`} icon={obj.isActive ? <EyeOutlined /> : <EyeInvisibleOutlined />}></Button>

                    </Popconfirm>


                    <Popconfirm title="Are You Sure !"
                        description="Once you update,you can also re-update !"
                        onCancel={() => messageApi.info("No Changes occur !")}
                        onConfirm={() => onEditUser(obj)}

                    >

                        <Button type='text' className='!bg-green-100 !text-green-500' icon={<EditOutlined />}></Button>

                    </Popconfirm>


                    <Popconfirm
                        title="Are You Sure ?"
                        description="Once You Deleted, you can not re-store !"
                        onCancel={() => messageApi.info("Your data is safe !")}
                        onConfirm={() => onDeleteUser(obj._id, obj.customerLoginId)}

                    >

                        <Button type='text' className='!bg-rose-100 !text-rose-500' icon={<DeleteOutlined />}></Button>
                    </Popconfirm>
                </div>
            )
        },
    ];

    const onCloseModal = () => {
        accountForm.resetFields();
        setAccountModal(false)
        setEdit(null)
    }

    return (
        <div>
            {context}
            <div className='grid'>
                <Card
                    title="Account List"
                    style={{ overflowX: "auto" }}
                    extra={
                        <div className='flex gap-x-3'>
                            <Input placeholder='Search By All' prefix={<SearchOutlined />} onChange={onSearch} />
                            <Button onClick={() => setAccountModal(true)} type='text' className='!font-bold !bg-blue-500 !text-white'>Add New Account</Button>
                        </div>
                    }
                >
                    <Table columns={columns} dataSource={allCustomer} scroll={{ x: "max-content" }} />
                </Card>
            </div>

            <Modal footer={null} title="Open New Account" open={accountModal} onCancel={onCloseModal} width={820}>
                <Form layout='vertical' onFinish={edit ? onUpdate : onFinish} form={accountForm}>
                    {
                        !edit &&
                        <div className='grid md:grid-cols-3 gap-x-3'>
                            <Item label="Account No" name="accountNo" rules={[{ required: true }]}>
                                <Input disabled placeholder='Account no' />
                            </Item>
                            <Item label="Email" name="email" rules={[{ required: edit ? true : false }]}>
                                <Input disabled={edit ? true : false} placeholder='Enter Email' />
                            </Item>
                            <Item label="Password" name="password" rules={[{ required: edit ? false : true }]}>
                                <Input.Password placeholder='Password' disabled={edit ? true : false} />
                            </Item>
                        </div>
                    }
                    <div className="grid md:grid-cols-3 gap-x-3">

                        <Item label="FullName" name="fullname" rules={[{ required: true }]}>
                            <Input placeholder='Full name' />
                        </Item>
                        <Item label="Mobile" name="mobile" rules={[{ required: true }]}>
                            <Input placeholder='Mobile Number' />
                        </Item>
                        <Item label="Father Name" name="fatherName" rules={[{ required: true }]}>
                            <Input placeholder='Father name' />
                        </Item>

                        <Item label="DOB" name="dob" rules={[{ required: true }]}>
                            <Input type='date' />
                        </Item>
                        <Item label="Gender" name="gender" rules={[{ required: true }]}>
                            <Select placeholder="Select The Gender">
                                <Option value="male">Male</Option>
                                <Option value="female">Female</Option>
                            </Select>
                        </Item>
                        <Item label="Currency" name="currency" rules={[{ required: true }]}>
                            <Select placeholder="Select The Currency">
                                <Option value="inr">INR</Option>
                                <Option value="usd">USD</Option>
                            </Select>
                        </Item>
                        <Item label="Photo" name="xyz" >
                            <Input type='file' onChange={handlePhoto} />
                        </Item>
                        <Item label="Signature" name="dfrf" >
                            <Input type='file' onChange={handleSignature} />
                        </Item>
                        <Item label="Document" name="nus" >
                            <Input type='file' onChange={handleDocument} />
                        </Item>
                    </div>

                    <Item label="Address" name="address" rules={[{ required: true }]}>
                        <Input.TextArea />
                    </Item>

                    <Item className='flex justify-end items-center'>
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
            </Modal>
        </div>
    );
}

export default NewAccount;
