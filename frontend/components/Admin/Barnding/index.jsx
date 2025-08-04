import { Button, Card, Form, Input, message } from "antd"
import Adminlayout from "../../layout/Adminlayout"
import { EditFilled } from "@ant-design/icons"
const { Item } = Form
import { trimData, http } from '../../../modules/modules';
import { useEffect, useState } from "react";


const Branding = () => {

    const [bankForm] = Form.useForm();
    const [messageApi, context] = message.useMessage();
    const [photo, setPhoto] = useState(null);
    const [loading, setLoading] = useState(false);
    const [no, setNo] = useState(0);
    const [brandings, setBrandings] = useState(null);
    const [edit, setEdit] = useState(false)



    //get app branding data
    useEffect(() => {
        const fetcher = async () => {
            try {
                const httpReq = http();
                const { data } = await httpReq.get("/api/branding");
                bankForm.setFieldsValue(data?.data[0])
                setBrandings(data?.data[0]);
                setEdit(true)
            } catch (err) {
                messageApi.error("Unable to fetch data !");
            }
        }
        fetcher();


    }, [no])


    //store bank details into database
    const onFinish = async (values) => {
        try {
            setLoading(true)
            const finalObj = trimData(values);
            finalObj.bankLogo = photo ? photo : "bankImages/dummy.png";
            const userInfo = {
                email: finalObj.email,
                fullname: finalObj.fullname,
                password: finalObj.password,
                userType: "Admin",
                isActive: true,
                profile: "bankImages/dummy.png"
            }

            const httpReq = http();
            await httpReq.post('/api/branding', finalObj)
            await httpReq.post('/api/users', userInfo);
            messageApi.success("Branding Created Successfully !");
            bankForm.resetFields();
            setPhoto(null);
            setNo(brandings ? false : true)


        } catch (err) {
            messageApi.error('Unable to store branding !')

        } finally {
            setLoading(false)
        }
    }

    //Update the bank details in the database
    const onUpdate = async (values) => {
        try {
            setLoading(true)
            const finalObj = trimData(values);
            if (photo) {
                finalObj.bankLogo = photo;
            }


            const httpReq = http();
            await httpReq.put(`/api/branding/${brandings._id}`, finalObj)

            messageApi.success("Branding Update Successfully !");
            bankForm.resetFields();
            setPhoto(null)
            setNo(no + 1)


        } catch (err) {
            messageApi.error('Unable to Update branding !')

        } finally {
            setLoading(false)
        }
    }

    //handle upload
    const handleUpload = async (e) => {
        try {
            let file = e.target.files[0];
            const formData = new FormData();
            formData.append("photo", file);
            const httpReq = http();
            const { data } = await httpReq.post("/api/upload", formData);
            setPhoto(data.filePath);
        } catch (err) {
            messageApi.error("Unable to upload !");

        }

    }


    return (
        <Adminlayout>
            {context}
            <Card
                title="Bank Details"
                extra={
                    <Button onClick={() => setEdit(!edit)} icon={<EditFilled />}></Button>

                }
            >
                <Form
                    form={bankForm}
                    onFinish={brandings ? onUpdate : onFinish}
                    layout="vertical"
                    disabled={edit}
                >
                    <div className="grid md:grid-cols-3 gap-x-3">
                        <Item rules={[{ required: true }]} label="Bank Name" name="bankName">
                            <Input />
                        </Item>
                        <Item
                            rules={[{ required: true }]}
                            label="Bank Tagline"
                            name="bankTagline">
                            <Input />
                        </Item>
                        <Item
                            
                            label="Bank Logo"
                            name="xyz">
                            <Input type="file" onChange={handleUpload} />
                        </Item>
                        <Item
                            rules={[{ required: true }]}
                            label="Bank Account No"
                            name="bankAccountNo">
                            <Input />
                        </Item>
                        <Item
                            rules={[{ required: true }]}
                            label="Bank Account Transaction Id"
                            name="bankTransactionId">
                            <Input />
                        </Item>
                        <Item
                            rules={[{ required: true }]}
                            label="Bank Address"
                            name="bankAddress">
                            <Input />
                        </Item>
                        <div className={`${brandings ? "hidden" : "md:col-span-3 grid md:grid-cols-3 gap-x-3"}`}>
                            <Item
                                rules={[{ required: brandings ? false : true }]}

                                label="Admin Fullname"
                                className="whitespace-nowrap"
                                name="fullname">
                                <Input />
                            </Item>
                            <Item
                                rules={[{ required: brandings ? false : true }, {
                                    pattern: /^[a-zA-Z0-9._%+-]+@gmail\.com$/,
                                    message: 'Only Gmail addresses are allowed (e.g. user@gmail.com)',
                                },]}
                                label="Admin Email"
                                name="email">
                                <Input />
                            </Item>
                            <Item
                                rules={[{ required: brandings ? false : true }]}
                                label="Admin Password"
                                name="password">
                                <Input.Password />
                            </Item>
                        </div>
                        <Item

                            label="Bank LinkedIn"
                            name="bankLinkedIn">
                            <Input type="url" />
                        </Item>
                        <Item

                            label="Bank Twitter"
                            name="bankTwitter">
                            <Input type="url" />
                        </Item>
                        <Item

                            label="Bank Facebook"
                            name="bankFacebook">
                            <Input type="url" />
                        </Item>



                    </div>
                    <Item label="Bank description" name="bankDesc">
                        <Input.TextArea></Input.TextArea>
                    </Item>
                    {
                        brandings ?
                            <Item className="flex justify-end items-center">
                                <Button loading={loading} className="!bg-rose-500 !text-white !font-bold" htmlType="submit">
                                    Update
                                </Button>
                            </Item> :
                            <Item className="flex justify-end items-center">
                                <Button loading={loading} type="primary" htmlType="submit">
                                    Submit
                                </Button>
                            </Item>
                    }
                </Form>

            </Card>
        </Adminlayout>
    )
}

export default Branding